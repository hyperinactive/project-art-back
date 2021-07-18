const { UserInputError } = require('apollo-server-express');
const Request = require('../../models/Request');
const User = require('../../models/User');
const authenticateHTTP = require('../../utils/authenticateHTTP');

const requestResolvers = {
  Query: {
    checkFriendRequests: async (_, { userID }, { req }) => {
      const user = authenticateHTTP(req);

      const fUser = await User.findById(userID);
      if (!fUser) throw new UserInputError('Nonexistent user');

      const request = await Request.findOne({
        fromUser: userID,
        toUser: user.id,
      });

      console.log({
        request,
        isSend: request !== null,
      });

      return {
        request,
        isSent: request !== null,
      };
    },
    getUserRequests: async (_, __, { req }) => {
      const user = authenticateHTTP(req);

      const requests = await Request.find({
        $or: [{ fromUser: user.id }, { toUser: user.id }],
      })
        .populate('fromUser', 'id username imageURL')
        .populate('toUser', 'id username imageURL')
        .sort({ createdAt: -1 });

      return requests;
    },
  },
};

module.exports = requestResolvers;
