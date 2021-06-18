const {
  UserInputError,
  AuthenticationError,
} = require('apollo-server-express');

const checkAuth = require('../../../utils/checkAuth');
const User = require('../../../models/User');

const Query = {
  getUsers: async (_, __, context) => {
    checkAuth(context);
    let users = null;
    try {
      users = await User.find({});
    } catch (error) {
      throw new AuthenticationError('Action not allowed', { error });
    }
    return users;
  },
  getUser: async (_, { userID }) => {
    const errors = {};

    try {
      const user = await User.findById(userID);

      if (!user) {
        errors.userNotFound = 'User not found';
        throw new UserInputError('UserInputError', { errors });
      }
      await user.populate('friends', 'id username').execPopulate();
      return user;
    } catch (error) {
      throw new Error(error);
    }
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
};

module.exports = Query;
