/* eslint-disable no-underscore-dangle */
const bcrypt = require('bcrypt');
const { UserInputError } = require('apollo-server-express');

const User = require('../../../../models/User');
const { validateLoginInput } = require('../../../../utils/validators');
const { generateToken } = require('../../../../utils/generate');

/**
 * log in users
 *
 * @param {function} _ apollo parent resolver
 * @param {username: string, password: string} { username, password }
 * @return {Object} user and token
 */
const login = async (_, { username, password }) => {
  // destructure the validateLoginInput
  const { errors, valid } = validateLoginInput(username, password);

  if (!valid) {
    throw new UserInputError('Not valid', { errors });
  }

  // try and find a user that matches the username and pass
  const user = await User.findOne({ username });

  // 404
  // if no user has been found, we'll get a '[]' and not null
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
};

module.exports = login;
