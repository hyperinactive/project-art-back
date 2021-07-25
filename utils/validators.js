/* eslint-disable no-param-reassign */
// don't actually throw any errors here, just collect them and pass as props

const User = require('../models/User');

/**
 * @function validatePasswordConfirmation validates password input
 * TODO: immutability dude! make it generate error obj and merge it where it's been called
 *
 * @param {string} password
 * @param {string} confirmPassword
 * @param {Object.<string, string>} errors
 */
const validatePasswordConfirmation = (password, confirmPassword, errors) => {
  if (password.trim() === '') {
    errors.password = 'Password empty';
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Password doesn't match";
  }
};

/**
 * @function validateLength validates lengths of usernames and passwords
 *
 * @param {string} username
 * @param {string} password
 * @param {Object.<string, string>} errors
 */
const validateLength = (username, password, errors) => {
  if (username.trim() === '') {
    errors.username = 'Username empty';
  }

  if (password.trim() === '') {
    errors.password = 'Password empty';
  }

  if (username.length > 15) {
    errors.usernameLength = 'Username cannot be longer than 15 characters';
  }

  if (password.length < 6) {
    errors.passwordLength = 'Password must be at least 7 characters long';
  }

  if (password.length > 25) {
    errors.passwordLength = 'Password cannot be longer than 25 characters';
  }
};

/**
 * @function validateRegisterInput validates register input
 *
 * @param {string} username
 * @param {string} email
 * @param {string} password
 * @param {string} confirmPassword
 * @return {Object.<Object.<string, string>, boolean>} error object and validation confirmation
 */
const validateRegisterInput = (username, email, password, confirmPassword) => {
  // building up the error object based on the validation errors a user may encounter
  const errors = {};

  validateLength(username, password, errors);

  // handle email
  if (email.trim() === '') {
    errors.email = 'Email empty';
  } else {
    const emailRegEx = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    if (!email.match(emailRegEx)) {
      errors.email = 'Email not valid';
    }
  }
  validatePasswordConfirmation(password, confirmPassword, errors);

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};

/**
 * @function validateLoginInput validates login input
 *
 * @param {string} username
 * @param {string} password
 * @return {Object.<Object.<string, string>, boolean>} error object and validation confirmation
 */
const validateLoginInput = (username, password) => {
  const errors = {};

  // handle username
  if (username.trim() === '') {
    errors.username = 'Username empty';
  }
  if (password.trim() === '') {
    errors.password = 'Password empty';
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};

/**
 * @function validatePostInput validates post input
 *
 * @param {string} body
 * @return {Object.<Object.<string, string>, boolean} error object and validation confirmation
 */
const validatePostInput = (body) => {
  const errors = {};
  if (body.trim() === '') errors.body = 'Body empty';
  if (body.length > 200)
    errors.bodyLength = 'Post body cannot be longer than 200 characters';
  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};

/**
 * @function checkForExistingUsername check for existing username
 *
 * @param {string} username
 * @return {boolean} is username unique
 */
const checkForExistingUsername = async (username) => {
  const usernameCheck = await User.findOne({ username });
  return usernameCheck !== null;
};

/**
 * @function checkForExistingEmail check for existing email
 *
 * @param {string} email
 * @return {boolean} is email unique
 */
const checkForExistingEmail = async (email) => {
  const emailCheck = await User.findOne({ email });
  return emailCheck !== null;
};

module.exports = {
  validateRegisterInput,
  validateLoginInput,
  validatePasswordConfirmation,
  validatePostInput,
  validateLength,
  checkForExistingEmail,
  checkForExistingUsername,
};
