const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

const register = async (req, res) => {
  const { name, email, password } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: 'User already exists' });
  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed });
  res.status(201).json({ _id: user._id, name: user.name, email: user.email, token: generateToken(user._id) });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(400).json({ message: 'Invalid credentials' });
  res.json({ _id: user._id, name: user.name, email: user.email, token: generateToken(user._id) });
};

module.exports = { register, login };