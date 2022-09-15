const router = require("express").Router();
const User = require("../model/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { registerValidation, loginValidation } = require("../validation");
router.post("/register", async (req, res) => {
  // validate data before making user
  const { error } = registerValidation(req.body);
  // res.send(error.details[0].message);
  if (error) return res.status(400).send(error.details[0].message);
  // Check if the user is already is in the database
  const emailExists = await User.findOne({ email: req.body.email });
  if (emailExists) return res.status(400).send("Email already exists");
  // Hash passwords
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(req.body.password, salt);

  // Create a new user
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashPassword,
  });
  try {
    const savedUser = await user.save();
    res.send({ user: user._id });
  } catch (err) {
    res.status(400).send(err);
  }
});
//LOGIN
router.post("/login", async (req, res) => {
  console.log(req.body);
  const { error } = loginValidation(req.body);
  // res.send(error.details[0].message);
  if (error) return res.status(400).send(error.details);
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Email does not exists");
  // password is incorrect
  const validPass = await bcrypt.compare(req.body.password, user.password);
  if (!validPass) return res.status(400).send("Invalid password");

  // Create and assign a token
  const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
  res.header("auth-token", token).send(token);
});
module.exports = router;

// asfasfasdfds
