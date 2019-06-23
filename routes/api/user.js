const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const config = require("config");
const jwt = require("jsonwebtoken");
//destructuing from express-validator
const { check, validationResult } = require("express-validator/check");
const User = require("../../models/users");
//route         POST api/user
//description   register user
//access        Public

router.post(
  "/",
  [
    check("name", "Name must be provided for registration..")
      .not()
      .isEmpty(),
    check("email", "Email must be provided").isEmail(),
    check("password", "password must be strong..").isLength({
      min: 6
    })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(404).json({ errors: errors.array() });
    }
    const { name, email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "user already exist" }] });
      }

      const avatar = gravatar.url(email, {
        s: "200", //size
        r: "pg", //avoid inappropriate content r-->rating
        d: "mm" // default image
      });
      user = new User({
        name,
        email,
        password,
        avatar
      });
      const salt = await bcrypt.genSalt(10); // .gensalt() returns promise
      user.password = await bcrypt.hash(password, salt);

      await user.save();

      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) {
            throw error;
          }
          res.json({ token });
        }
      );
      //res.send("user registered");
    } catch (err) {
      return res.status(500).send("server error");
    }
  }
);

module.exports = router;
