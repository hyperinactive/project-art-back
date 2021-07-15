/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
const devRegister = require('./devRegister');
const register = require('./register');
const login = require('./login');
const addFriend = require('./addFriend');
const sendVerification = require('./sendVerification');
const verifyUser = require('./verifyUser');
const updateUser = require('./updateUser');

const Mutation = {
  devRegister,
  register,
  login,
  addFriend,
  sendVerification,
  verifyUser,
  updateUser,
};

module.exports = Mutation;
