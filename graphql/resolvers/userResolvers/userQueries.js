const { UserInputError, ApolloError } = require('apollo-server-express');

const authenticateHTTP = require('../../../utils/authenticateHTTP');
const User = require('../../../models/User');

const Query = {
  /**
   * list all users
   *
   * @param {*} _ apollo parent resolver
   * @param {*} __ function arguments
   * @param {req: express.Request} { req } request object from the context
   * @return {*}
   */
  getUsers: async (_, __, { req }) => {
    authenticateHTTP(req);
    let users = null;
    users = await User.find({});
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
      throw new ApolloError('InternalError', { error });
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
      throw new ApolloError('InternalError', { error });
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
      throw new ApolloError(error);
    }
  },
};

module.exports = Query;
