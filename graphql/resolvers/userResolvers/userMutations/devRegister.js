/* eslint-disable no-underscore-dangle */
const bcrypt = require('bcrypt');
const { ApolloError, UserInputError } = require('apollo-server-express');

const User = require('../../../../models/User');
const {
  checkForExistingUsername,
  checkForExistingEmail,
  validateRegisterInput,
} = require('../../../../utils/validators');
const { generateToken } = require('../../../../utils/generate');

/**
 * register users without email verification
 *
 * @param {function} _ apollo parent resolver
 * @param {Object.<string, Object.<string, string>>} { devRegisterInput: { username, email, password, secretKey } }
 * @return {Object.<User, string>} user and token
 */
const devRegister = async (
  _,
  { devRegisterInput: { username, email, password, secretKey } }
) => {
  if (secretKey !== process.env.DEV_SECRET_KEY)
    throw new ApolloError('Nice try bucko');

  const { valid, errors } = validateRegisterInput(
    username,
    email,
    password,
    password
  );

  if (!valid) {
    throw new UserInputError('Errors', { errors });
  }

  if (await checkForExistingUsername(username)) {
    errors.usernameInUse = 'Username already in use';
    throw new UserInputError('Username already in use', { errors });
  }

  if (await checkForExistingEmail(email)) {
    errors.emailInUse = 'Email already in use';
    throw new UserInputError('Email already in use', { errors });
  }

  const newPassword = await bcrypt.hash(password, 12);

  /**
   * @type {User}
   */
  const newUser = User({
    email,
    emailVerified: true,
    username,
    password: newPassword,
    createdAt: new Date().toISOString(),
    friends: [],
    projects: [],
    imageURL: null,
  });

  const res = await newUser.save();
  const token = generateToken(res);

  return {
    ...res._doc, // where the document is stored, user data, from MongoDB
    id: res._id, // id is not stored in the doc so we extract it like this
    token,
  };
};

module.exports = devRegister;
