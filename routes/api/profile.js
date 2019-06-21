const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const Profile = require("../../models/profile");
const User = require("../../models/users");
const request = require("request");
const config = require("config");
const { check, validationResult } = require("express-validator/check");
//route         GET api/profile/me
//description   current profile based on user id
//access        Public

router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      "user",
      ["name", "avatar"]
    );
    if (!profile) {
      return res.status(400).json({ msg: "there is no profile for this user" });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("server error");
  }
});

//route         POST api/profile
//description   create or update user profile
//access        Private

router.post(
  "/",
  [
    auth,
    [
      check("status", "status is required")
        .not()
        .isEmpty(),
      check("skills", "skills is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    //destructuring the elements of profile
    const {
      company,
      website,
      status,
      skills,
      bio,
      githubusername,
      location,
      youtube,
      linkedin,
      facebook,
      instagram
    } = req.body;

    //build profile object

    const profilefields = {};
    profilefields.user = req.user.id;
    if (company) profilefields.company = company;
    if (website) profilefields.website = website;
    if (status) profilefields.status = status;
    if (bio) profilefields.bio = bio;
    if (location) profilefields.location = location;
    if (githubusername) profilefields.githubusername = githubusername;
    if (skills) {
      profilefields.skills = skills.split(",").map(skill => skill.trim());
    }

    profilefields.social = {};
    if (youtube) profilefields.social.youtube = youtube;
    if (facebook) profilefields.social.facebook = facebook;
    if (linkedin) profilefields.social.linkedin = linkedin;
    if (instagram) profilefields.social.instagram = instagram;

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      //updating the profile if it already exists
      if (profile) {
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          {
            $set: profilefields
          },
          {
            new: true
          }
        );

        res.json(profile);
      } else {
        profile = new Profile(profilefields);
        await profile.save();
        res.json(profile);
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).json("server error");
    }
  }
);

//route         GET api/profile
//description   get all the profiles
//access        Public

router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);
    //console.log(profiles);
    res.json(profiles);
  } catch (error) {
    console.error(error.message);
    res.status(500).json("Server error");
  }
});

//route         GET api/profile/user/:user_id
//description   get profile by user_id
//access        Private

router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id
    }).populate("user", ["name", "avatar"]);
    if (!profile) {
      res.status(400).json({ msg: "there is no profile for this user" });
    }

    res.json(profile);
  } catch (error) {
    console.error(error.message);
    if (error.kind == "ObjectId") {
      return res.status(400).json({ msg: "there is no profile for this user" });
    }

    res.status(500).json("Server error");
  }
});

//route         DELETE api/profile
//description   delete profile,user & posts
//access        Private

router.delete("/", auth, async (req, res) => {
  try {
    //delete users posts

    //remove profile
    await Profile.findOneAndRemove({ user: req.user.id });
    //remove user
    await User.findOneAndRemove({ _id: req.user.id });

    res.json({ msg: "user removed" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json("Server error");
  }
});

//route         PUT api/profile/experience
//description   add experience
//access        Private

router.put(
  "/experience",
  [
    auth,
    [
      check("title", "title is required")
        .not()
        .isEmpty(),
      check("company", "company is required")
        .not()
        .isEmpty(),
      check("from", "from date is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      company,
      loaction,
      from,
      to,
      current,
      description
    } = req.body;

    const newexp = {
      title,
      company,
      loaction,
      from,
      to,
      current,
      description
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.experience.unshift(newexp); // unshift works similar to stack, elements are added at the beginning of array
      await profile.save();
      res.json(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).json("Server error");
    }
  }
);

//route         DELETE api/profile/experience/:exp_id
//description   delete experience from profile
//access        Private

router.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    //get index to be removed
    const removeindex = profile.experience
      .map(item => item.id)
      .indexOf(req.params.exp_id); //map takes to each item of experience and indexOf matches the index required

    profile.experience.splice(removeindex, 1); // removes elements from the experience array
    await profile.save();
    res.json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).json("Server error");
  }
});

//route         PUT api/profile/education
//description   add education
//access        Private

router.put(
  "/education",
  [
    auth,
    [
      check("school", "school is required")
        .not()
        .isEmpty(),
      check("degree", "degree is required")
        .not()
        .isEmpty(),
      check("fieldofstudy", "fieldofstudy is required")
        .not()
        .isEmpty(),
      check("from", "from date is required")
        .not()
        .isEmpty(),
      check("current", "current educational status is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description
    } = req.body;

    const newEdu = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.education.unshift(newEdu); // unshift works similar to stack, elements are added at the beginning of array
      await profile.save();
      res.json(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).json("Server error");
    }
  }
);

//route         DELETE api/profile/education/:edu_id
//description   delete education from profile
//access        Private

router.delete("/education/:edu_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    //get index to be removed
    const removeindex = profile.education
      .map(item => item.id)
      .indexOf(req.params.edu_id); //map takes to each item of education and indexOf matches the index required

    profile.education.splice(removeindex, 1); // removes elements from the education array
    await profile.save();
    res.json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).json("Server error");
  }
});

//route         GET api/profile/github/:username
//description   get users repos from github
//access        Public

router.get("/github/:username", (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${
        req.params.username
      }/repos?per_page=5&sort=created:asc&client_id=${config.get(
        "githubClientId"
      )}&client_secrets=${config.get("githubClientSecret")}`,
      method: "GET",
      headers: { "user-agent": "node.js" }
    };
    request(options, (error, response, body) => {
      if (error) {
        return console.error(error);
      }

      if (response.statusCode !== 200) {
        return res.status(404).json({ msg: "no github profile found!!" });
      }
      res.json(JSON.parse(body));
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json("Server error");
  }
});

module.exports = router;
