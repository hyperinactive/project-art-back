/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
const devRegister = require('./devRegister');
const register = require('./register');
const login = require('./login');
const addFriend = require('./addFriend');
const sendVerification = require('./sendVerification');
const verifyUser = require('./verifyUser');
const updateUser = require('./updateUser');
const sendFriendRequest = require('./sendFriendRequest');
const acceptFriendRequest = require('./acceptFriendRequest');

const Mutation = {
  devRegister,
  register,
  login,
  addFriend,
  sendVerification,
  verifyUser,
  updateUser,
  sendFriendRequest,
  acceptFriendRequest,
};

module.exports = Mutation;
