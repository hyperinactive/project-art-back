/* eslint-disable no-underscore-dangle */
const bcrypt = require('bcrypt');
const { UserInputError } = require('apollo-server-express');
const sgMail = require('@sendgrid/mail');

const User = require('../../../../models/User');
const KeyCode = require('../../../../models/KeyCode');

const {
  validateRegisterInput,
  checkForExistingUsername,
  checkForExistingEmail,
} = require('../../../../utils/validators');
const {
  generateRandomCode,
  generateToken,
} = require('../../../../utils/generate');
const generateTemplate = require('../../../../utils/emailTemplate');

/**
 * registers users
 *
 * @param {*} _ apollo parent resolver
 * @param {Object.<string, Object.<string, string>>} { registerInput: { username, email, password, confirmPassword } }  register input
 * @throws {UserInputError} when data is invalid
 * @return {Object} User type object
 */
const register = async (
  _,
  { registerInput: { username, email, password, confirmPassword } }
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

  if (await checkForExistingUsername(username)) {
    errors.usernameInUse = 'Username already in use';
    throw new UserInputError('Username already in use', { errors });
  }

  if (await checkForExistingEmail(email)) {
    errors.emailInUse = 'Email already in use';
    throw new UserInputError('Email already in use', { errors });
  }

  const newPassword = await bcrypt.hash(password, 12);

  const newUser = User({
    email,
    emailVerified: false,
    username,
    password: newPassword,
    createdAt: new Date().toISOString(),
    friends: [],
    projects: [],
    imageURL: null,
  });

  // result of registering a new user
  const res = await newUser.save();
  // -----------------------------------------------------------------

  // generate code to send to the user
  const randomCode = generateRandomCode();
  const keyCode = new KeyCode({
    code: randomCode,
    createdAt: new Date().toISOString(),
    expiresIn: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // + 10min
    user: res._id,
  });

  await keyCode.save();

  // ----------------------------------------------------------------
  // compose and send mail template with the verification code
  sgMail.setApiKey(process.env.SG_KEY);
  const mail = {
    to: email,
    from: process.env.SG_SENDER,
    subject: 'ProjectArt - Email verification',
    html: generateTemplate(username, res._id, randomCode),
  };

  sgMail
    .send(mail)
    .then(() => {
      console.log(`Verification sent to ${email}`);
    })
    .catch((error) => {
      console.error(error);
    });
  // ----------------------------------------------------------------

  const token = generateToken(res);

  return {
    ...res._doc, // where the document is stored, user data, from MongoDB
    id: res._id, // id is not stored in the doc so we extract it like this
    token,
  };
};

module.exports = register;
