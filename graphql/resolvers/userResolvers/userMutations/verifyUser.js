/* eslint-disable no-underscore-dangle */
const { UserInputError, ApolloError } = require('apollo-server-express');

const KeyCode = require('../../../../models/KeyCode');
const User = require('../../../../models/User');

const authenticateHTTP = require('../../../../utils/authenticateHTTP');
const { generateToken } = require('../../../../utils/generate');

/**
 * verifies users
 *
 * @param {*} _ apollo parent resolver
 * @param {code: string} { code } function arguments
 * @param {express.Request} { req } request object from the context
 * @return {Object} user and token
 */
const verifyUser = async (_, { code }, { req }) => {
  const user = authenticateHTTP(req);
  const errors = {};

  const fUser = await User.findById(user.id);

  // TODO: holy shit, too much repetition
  // create custom errors/verification?
  if (!fUser) throw new UserInputError('Nonexistent user');
  if (fUser.emailVerified) throw new UserInputError('Already verified');

  const keycodes = await KeyCode.find({ user: user.id })
    .sort({ createdAt: 1 })
    .limit(1);
  if (keycodes.length === 0) throw new UserInputError('Nonexistent keycode');

  if (keycodes[0].expiresIn < new Date().toISOString()) {
    errors.codeExpired = 'Your code has expired';
  }

  if (Object.keys(errors).length > 0)
    throw new ApolloError('Internal error', { errors });

  if (code === keycodes[0].code) {
    fUser.emailVerified = true;
  }

  await fUser.save();
  await KeyCode.deleteMany({ user: user.id }); // in case the user racked up codes but used none
  const token = await generateToken(fUser);

  return {
    ...fUser._doc,
    id: fUser._id,
    token,
  };
};

module.exports = verifyUser;
