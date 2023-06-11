const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var fetchuser=require('../middleware/fetchuser')


const DT_SECRET = 'Maniisafinalyear$std';

//Route:1 create a user using post "/api/auth/create user".no login required
router.post('/createuser', [
  body('name').isLength({ min: 3 }),
  body('email').isEmail(),
  body('password').isLength({ min: 5 }),
], async (req, res) => {
  let success=false
  //if there are bad request and the arrors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({success, errors: errors.array() });
  }
  //check whether the user with same mail exists already
  try {


    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).json({success, error: "Sorry a user with same email already exists" })
    }
    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password, salt)

    user = await User.create({
      name: req.body.name,
      password: secPass,
      email: req.body.email,

    });
    const data = {
      user: {
        id: user.id
      }
    }
    const authtoken = jwt.sign(data, DT_SECRET);

    //res.json(user)
    success=true
    res.json({success, authtoken })

  } catch (error) {
    console.error(error.message);
    res.status(500).send("internal server error");
  }
})
//Route:2 authenticate a user using post "/api/auth/login".no login required
router.post('/login', [

  body('email', 'Enter valid email').isEmail(),
  body('password', 'Password can not be blank').exists(),
], async (req, res) => {
  let success=false
  //if there are bad request and the arrors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({success, errors: errors.array() });
  }
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      success=false
      return res.status(400).json({success, error: "Please try with correct cardentials" });
    }
    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      success=false
      return res.status(400).json({ success, error: "Please try with correct cardentials" });
    
    }

    const data = {
      user: {
        id: user.id
      }
    }
    const authtoken = jwt.sign(data, DT_SECRET);
    success=true;
    res.json({ success, authtoken })
    
  } catch (error) {
    console.error(error.message);
    res.status(500).send("internal server error");


  }


})
//Route:3 get loggeed in user details using post "/api/auth/getuser".login required
router.post('/getuser',fetchuser,  async (req, res,) => {

  try {
    userId = req.user.id;
    const user = await User.findById(userId).select("-password")
    res.send(user)


  } catch (error) {
    console.error(error.message);
    res.status(500).send("internal server error");

  }
})

module.exports = router
