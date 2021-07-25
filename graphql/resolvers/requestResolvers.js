const { UserInputError } = require('apollo-server-express');

const Request = require('../../models/Request');
const User = require('../../models/User');
const authenticateHTTP = require('../../utils/authenticateHTTP');
const NonexistentError = require('../../utils/errors/NonexistentError');

const requestResolvers = {
  Query: {
    checkFriendRequests: async (_, { userID }, { req }) => {
      const user = authenticateHTTP(req);

      const fUser = await User.findById(userID);
      if (!fUser) throw new NonexistentError({ name: 'user', id: userID });

      const request = await Request.findOne({
        fromUser: userID,
        toUser: user.id,
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
  Mutation: {
    deleteRequest: async (_, { requestID }, { req }) => {
      const user = authenticateHTTP(req);

      const request = await Request.findByIdAndDelete(requestID);
      if (!request)
        throw new NonexistentError({ name: 'request', id: requestID });

      if (
        user.id.toString() === request.toUser.toString() ||
        user.id.toString() === request.fromUser.toString()
      ) {
        return request;
      }
      throw new UserInputError('Action not allowed');
    },
  },
};

module.exports = requestResolvers;
