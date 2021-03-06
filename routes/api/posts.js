const express = require('express')
const router = express.Router()
const Post = require('../../models/post')
const auth = require('../../middleware/auth')
const User = require('../../models/users')
const Profile = require('../../models/profile')
const { check, validationResult } = require('express-validator/check')

//route         POST api/posts
//description   create post route
//access        Private

router.post(
  '/',
  [
    auth,
    [
      check('text', 'text is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    try {
      const user = await User.findById(req.user.id).select('-password')

      const newpost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      })

      const post = await newpost.save()

      res.json(post)
    } catch (err) {
      console.error(err.message)
      res.status(500).json('Server Error')
    }
  }
)

//route         GET api/posts
//description   get all posts
//access        Private

router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 })
    res.json(posts)
  } catch (err) {
    console.error(err.message)
    res.status(500).json('Server Error')
  }
})

//route         GET api/posts/:id
//description   get post by id
//access        Private

router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)

    if (!post) {
      return res.status(404).json({ msg: 'post not found..' })
    }
    res.json(post)
  } catch (err) {
    console.error(err.message)
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'post not found..' })
    }

    res.status(500).json('Server Error')
  }
})

//route         DELETE api/posts/:id
//description   delete post by id
//access        Private

router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) {
      return res.status(404).json({ msg: 'post not found..' })
    }

    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'user not authorized..' })
    }
    await post.remove()

    res.json('post removed')
  } catch (err) {
    console.error(err.message)
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'post not found..' })
    }

    res.status(500).json('Server Error')
  }
})

//route         PUT api/posts/like/:id
//description   like a post
//access        Private

router.put('/like/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) {
      return res.status(404).json({ msg: 'post not found..' })
    }

    if (
      post.likes.filter(like => like.user.toString() === req.user.id).length > 0
    ) {
      return res.status(400).json('post already liked.')
    }

    post.likes.unshift({ user: req.user.id })
    await post.save()

    res.json(post.likes)
  } catch (err) {
    console.error(err.message)
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'post not found..' })
    }

    res.status(500).json('Server Error')
  }
})

//route         DELETE api/posts/unlike/:id
//description   unlike a post
//access        Private

router.put('/unlike/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) {
      return res.status(404).json({ msg: 'post not found..' })
    }

    if (
      post.likes.filter(like => like.user.toString() === req.user.id).length ==
      0
    ) {
      return res.status(400).json('post has not been liked yet!!')
    }

    //get id of user to be removed from likes array
    const removeindex = post.likes
      .map(like => like.user.toString())
      .indexOf(req.user.id)

    //remove the id from array using splice
    post.likes.splice(removeindex, 1)
    await post.save()

    res.json(post.likes)
  } catch (err) {
    console.error(err.message)
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'post not found..' })
    }

    res.status(500).json('Server Error')
  }
})

//route         POST api/posts/comment/:id
//description   add comments
//access        Private

router.post(
  '/comment/:id',
  [
    auth,
    [
      check('text', 'text is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    try {
      const user = await User.findById(req.user.id).select('-password')
      const post = await Post.findById(req.params.id)

      const newcomment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      }

      post.comments.unshift(newcomment)
      await post.save()

      res.json(post.comments)
    } catch (err) {
      console.error(err.message)
      res.status(500).json('Server Error')
    }
  }
)

//route         DELETE api/posts/comment/:id/:commnet_id
//description   delete comment
//access        Private

router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)

    if (!post) {
      return res.status(404).json('Post not found')
    }
    // pulling comment
    const comment = post.comments.find(
      comment => comment.id === req.params.comment_id
    )
    // check if comment not found
    if (!comment) {
      return res.status(404).json('comment not found')
    }
    // check if user is same who commented..

    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json('user not authorized')
    }

    //get index of comment to be removed
    const removeindex = await post.comments
      .map(comment => comment.user.toString())
      .indexOf(req.user.id)

    post.comments.splice(removeindex, 1)

    await post.save()
    res.json('comment removed..')
  } catch (err) {
    console.error(err.message)
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'post not found..' })
    }
    res.status(500).json('Server Error')
  }
})

module.exports = router
