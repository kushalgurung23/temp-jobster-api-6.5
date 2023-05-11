const User = require('../models/User')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, UnauthenticatedError, NotFoundError } = require('../errors')

const register = async (req, res) => {
  const user = await User.create({ ...req.body })
  const token = user.createJWT()
  const response = { user: { 
    name: user.name,
    email: user.email,
    location: user.location,
    lastName: user.lastName,
    token
  }}
  res.status(StatusCodes.CREATED).json(response)
}

const login = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    throw new BadRequestError('Please provide email and password')
  }
  const user = await User.findOne({ email })
  if (!user) {
    throw new UnauthenticatedError('Invalid Credentials')
  }
  const isPasswordCorrect = await user.comparePassword(password)
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError('Invalid Credentials')
  }
  // compare password
  const token = user.createJWT()
  res.status(StatusCodes.OK).json({ user: { 
    name: user.name,
    email: user.email,
    location: user.location,
    lastName: user.lastName,
    token
  }})
}

const updateUser = async (req, res) => {
  const {name, email, lastName, location} = req.body;
  console.log(req.user);
  if(!name || !email || !lastName || !location) {
    throw new BadRequestError('Please provide all values');
  }
  const user = await User.findOne({_id: req.user.userId})
  if(!user) {
    throw new NotFoundError('User does not exist')
  }
  user.email = email
  user.name = name
  user.lastName = lastName
  user.location = location

  await user.save();
  // TOKEN IS CREATED BECAUSE WHILE SIGNING JWT, WE SAVE NAME OF THE USER WHICH CAN BE CHANGED WHILE CALLING THIS API.
  const token = user.createJWT()
  res.status(StatusCodes.OK).json({ user: { 
    name: user.name,
    email: user.email,
    location: user.location,
    lastName: user.lastName,
    token
  }})
}

module.exports = {
  register,
  login,
  updateUser
}
