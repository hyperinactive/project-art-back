const {
  UserInputError,
  AuthenticationError,
} = require('apollo-server-express');

const authenticateHTTP = require('../../../utils/authenticateHTTP');
const User = require('../../../models/User');

const Query = {
  getUsers: async (_, __, { req }) => {
    authenticateHTTP(req);
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
  getFriends: async (_, __, { req }) => {
    const user = authenticateHTTP(req);

    try {
      const fUser = await User.findById(user.id).populate(
        'friends',
        'id username imageURL'
      );

      return fUser.friends;
    } catch (error) {
      throw new Error(error);
    }
  },
  getUserFriends: async (_, { userID }, { req }) => {
    authenticateHTTP(req);

    try {
      const fUser = await User.findById(userID).populate(
        'friends',
        'id username imageURL'
      );

      return fUser.friends;
    } catch (error) {
      throw new Error(error);
    }
  },
};

module.exports = Query;
