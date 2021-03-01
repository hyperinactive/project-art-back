/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// custom errors from apollo
const { UserInputError } = require('apollo-server-express');

const User = require('../../models/User');
const {
  validateRegisterInput,
  validateLoginInput,
} = require('../../utils/validators');

// generate a token
// res contains the user data
const generateToken = (user) =>
  jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
    },
    process.env.SECRET,
    {
      expiresIn: '45min', // dev time, too long for prod
    }
  );

const userResolvers = {
  Mutation: {
    // args is the input type (eg our registerInput)
    // register(parent, args, context, info) {
    async register(
      _,
      {
        // we're expecting an input which contains username, email, pass and conf
        registerInput: { username, email, password, confirmPassword },
      } // not using these, but they're here for educational purposes // context, // info,
    ) {
      // validate
      const { valid, errors } = validateRegisterInput(
        username,
        email,
        password,
        confirmPassword
      );
      // if there were problems take the errors from the errors obj in the validators.js
      // throw an error containing these
      if (!valid) {
        throw new UserInputError('Errors', { errors });
      }

      // check for an existing user via username or email
      const userUsernameCheck = await User.findOne({ username });
      if (userUsernameCheck) {
        throw new UserInputError('Username is already taken');
      }

      const userEmailCheck = await User.findOne({ username });
      if (userEmailCheck) {
        throw new UserInputError('Email is already in use');
      }

      password = await bcrypt.hash(password, 12);

      const newUser = User({
        email,
        username,
        password,
        createdAt: Date.now().toString(),
      });

      // result of registering a new user
      const res = await newUser.save();

      // make a token
      // perhaps only have id in the payload?
      const token = generateToken(res);

      return {
        ...res._doc, // where the document is stored, user data, from MongoDB
        id: res._id, // id is not stored in the doc so we extract it like this
        token,
      };
    },
    // again, no need to destructure from a type since we only need 2 things
    async login(_, { username, password }) {
      // destructure the validateLoginInput
      const { errors, valid } = validateLoginInput(username, password);

      if (!valid) {
        throw new UserInputError('Not valid', { errors });
      }

      // try and find a user that matches the username and pass
      const user = await User.findOne({ username });

      // 404
      // if no user has been found, we'll get a '[]' and not null
      // eslint-disable-next-line eqeqeq
      if (!user) {
        errors.general = 'User not found';
        throw new UserInputError('User not found', { errors });
      }

      const matchEmailPass = await bcrypt.compare(password, user.password);

      if (!matchEmailPass) {
        errors.general = 'Wrong password';
        throw new UserInputError('Wrong password', { errors });
      }

      const token = generateToken(user);

      return {
        ...user._doc, // where the document is stored, user data, from MongoDB
        id: user._id, // id is not stored in the doc so we extract it like this
        token,
      };
    },
  },
};

module.exports = userResolvers;
