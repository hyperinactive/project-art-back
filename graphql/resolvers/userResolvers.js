/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// custom errors from apollo
const {
  UserInputError,
  AuthenticationError,
} = require('apollo-server-express');

const User = require('../../models/User');
const {
  validateRegisterInput,
  validateLoginInput,
} = require('../../utils/validators');
const checkAuth = require('../../utils/checkAuth');

// generate a token
// res contains the user data
const generateToken = (user) =>
  jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    },
    process.env.SECRET,
    {
      expiresIn: '45min', // dev time, too long for prod
    }
  );

// username and email validation
const checkForExistingUsernme = async (username) => {
  const usernameCheck = await User.findOne({ username });
  return usernameCheck !== null;
};

const checkForExistingEmail = async (email) => {
  const emailCheck = await User.findOne({ email });
  return emailCheck !== null;
};

const userResolvers = {
  Query: {
    // TODO: for now, just give responses to all, secure the routes later
    getUsers: async (/* _, __,  context */) => {
      // const user = checkAuth(context);

      // if (user.role !== 'developer')
      //   throw new AuthenticationError('Action not allowed');

      const users = await User.find({});
      return users;
    },
    getUser: async (_, { userID }) => {
      const user = await User.findById(userID);
      const errors = {};

      if (!user) {
        errors.userNotFound = 'User not found';
        throw new UserInputError('UserInputError', { errors });
      }
      return user;
    },
    getFriends: async (_, __, context) => {
      const user = checkAuth(context);

      try {
        const fUser = await User.findById(user.id).populate('friends');

        return fUser.friends;
      } catch (error) {
        throw new Error(error);
      }
    },
  },
  Mutation: {
    // args is the input type (eg our registerInput)
    // register(parent, args, context, info) {
    register: async (
      _,
      {
        // we're expecting an input which contains username, email, pass and conf
        registerInput: { username, email, password, confirmPassword },
      } // not using these, but they're here for educational purposes // context, // info,
    ) => {
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

      if (await checkForExistingUsernme(username)) {
        errors.usernameInUse = 'Username already in use';
        throw new UserInputError('Username already in use', { errors });
      }

      if (await checkForExistingEmail(email)) {
        errors.emailInUse = 'Email already in use';
        throw new UserInputError('Email already in use', { errors });
      }

      password = await bcrypt.hash(password, 12);

      const newUser = User({
        email,
        username,
        password,
        createdAt: new Date().toISOString(),
        friends: [],
        projects: [],
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
    login: async (_, { username, password }) => {
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
        errors.username = 'User not found';
        throw new UserInputError('User not found', { errors });
      }

      const matchEmailPass = await bcrypt.compare(password, user.password);

      if (!matchEmailPass) {
        errors.password = 'Wrong password';
        throw new UserInputError('Wrong password', { errors });
      }

      const token = generateToken(user);

      return {
        ...user._doc, // where the document is stored, user data, from MongoDB
        id: user._id, // id is not stored in the doc so we extract it like this
        token,
      };
    },
    updateUser: async (
      _,
      {
        updateUserInput: { username, email, password, confirmPassword, userID },
      },
      context
    ) => {
      const user = checkAuth(context);

      if (userID !== user.id || user.role !== 'developer')
        throw new AuthenticationError('Action not allowed');

      // reusing the register input validation
      const { valid, errors } = validateRegisterInput(
        username,
        email,
        password,
        confirmPassword
      );

      if (!valid) {
        throw new UserInputError('Not valid', { errors });
      }

      if (password !== confirmPassword)
        throw new UserInputError("Passwords don't match");

      const newUser = await User.findById(userID);

      if (!newUser) throw new UserInputError('User not found');

      checkForExistingUsernme(username);
      checkForExistingEmail(email);

      const hashedPass = await bcrypt.hash(password, 12);
      const update = { username, email, hashedPass };
      await newUser.updateOne(update);

      const token = generateToken(newUser);

      return {
        ...newUser._doc, // where the document is stored, user data, from MongoDB
        id: newUser._id, // id is not stored in the doc so we extract it like this
        token,
      };
    },
    // TODO: obviously we need to accept or decline these, placeholder
    addFriend: async (_, { username }, context) => {
      const user = checkAuth(context);

      try {
        const reciever = await User.findOne({ username });
        const sender = await User.findById(user.id);
        const errors = {};

        if (!reciever) {
          errors.username = "User with that username doesn't exist";
          throw new UserInputError('No user found', { errors });
        }

        if (reciever.friends.find((friend) => friend.id === user.id)) {
          errors.alreadyFriends = 'Already friends';
          throw new UserInputError('Input error', { errors });
        }

        reciever.friends.push(user.id);
        sender.friends.push(reciever.id);
        await reciever.save();
        await sender.save();

        return reciever;
      } catch (error) {
        throw new Error(error);
      }
    },
  },
};

module.exports = userResolvers;
