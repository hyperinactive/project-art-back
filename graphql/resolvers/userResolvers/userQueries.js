const { UserInputError } = require('apollo-server-express');

const checkAuth = require('../../../utils/checkAuth');
const User = require('../../../models/User');

const Query = {
  // TODO: for now, just give responses to all, secure the routes later
  getUsers: async (/* _, __,  context */) => {
    // const user = checkAuth(context);

    // if (user.role !== 'developer')
    //   throw new AuthenticationError('Action not allowed');

    const users = await User.find({});
    return users;
  },
  getUser: async (_, { userID }) => {
    const user = await User.findById(userID);
    const errors = {};

    if (!user) {
      errors.userNotFound = 'User not found';
      throw new UserInputError('UserInputError', { errors });
    }
    return user;
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
