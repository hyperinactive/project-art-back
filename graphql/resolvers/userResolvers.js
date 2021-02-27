/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// custom errors from apollo
const { UserInputError } = require('apollo-server-express');

const User = require('../../models/User');
const validateRegisterInput = require('../../utils/validators');

const userResolvers = {
  Mutation: {
    // args is the input type (eg our registerInput)
    // register(parent, args, context, info) {
    async register(
      _,
      {
        // we're expecting an input which contains username, email, pass and conf
        registerInput: {
          username, email, password, confirmPassword,
        },
      },
      // not using these, but they're here for educational purposes
      // context,
      // info,
    ) {
      // validate
      const { valid, errors } = validateRegisterInput(username, email, password, confirmPassword);
      // if there were problems take the errors from the errors obj in the validators.js
      // throw an error containing these
      if (!valid) {
        throw new UserInputError('Errors', { errors });
      }

      // check for an existing user via username or email
      const user = User.find().or([{ username }, { email }]);
      if (user) {
        // these errors willk be used on the client side
        throw new UserInputError('Username and/or email is already taken', {
          // payload of errors
          errors: {
            username: 'This username is taken',
            email: 'This email is already in use',
          },
        });
      }

      password = await bcrypt.hash(password, 12);

      const newUser = User({
        email,
        username,
        password,
        createdAt: Date.now().toString(),
      });

      const res = await newUser.save();

      // make a token
      // perhaps only have id in the payload?
      const token = jwt.sign({
        id: res.id,
        email: res.email,
        username: res.username,
      }, process.env.SECRET,
      {
        expiresIn: '45min', // dev time, too long for prod
      });

      return {
        ...res._doc, // where the document is stored, user data
        id: res._id, // id is not stored in the doc
        token,
      };
    },
  },
};

module.exports = userResolvers;
