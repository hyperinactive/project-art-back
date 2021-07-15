/* eslint-disable no-underscore-dangle */
const { UserInputError, ApolloError } = require('apollo-server-express');

const KeyCode = require('../../../../models/KeyCode');
const User = require('../../../../models/User');

const authenticateHTTP = require('../../../../utils/authenticateHTTP');
const { generateToken } = require('../../../../utils/generate');

const verifyUser = async (_, { code }, { req }) => {
  const user = authenticateHTTP(req);
  const errors = {};

  const fUser = await User.findById(user.id);

  // TODO: holy shit, too much repetition
  // create custom errros/verification?
  if (!fUser) throw new UserInputError('Nonexistent user');
  if (fUser.emailVerified) throw new UserInputError('Already verified');

  const keycode = await KeyCode.find({ user: user.id });
  console.log(keycode);
  if (keycode.length === 0) throw new UserInputError('Nonexistent keycode');

  if (keycode[0].expiresIn < new Date().toISOString()) {
    errors.codeExpired = 'Your code has expired';
  }

  if (Object.keys(errors).length > 0)
    throw new ApolloError('Internal error', { errors });

  if (code === keycode[0].code) {
    fUser.emailVerified = true;
  }

  await fUser.save();
  // await KeyCode.deleteMany({ user: user.id }); // in case the user racked up codes but used none
  const token = generateToken(fUser);

  return {
    ...fUser._doc,
    id: fUser._id,
    token,
  };
};

module.exports = verifyUser;
