const { ApolloError, UserInputError } = require('apollo-server-express');

const Request = require('../../../../models/Request');
const authenticateHTTP = require('../../../../utils/authenticateHTTP');

/**
 * creates friend requests
 *
 * @param {function} _ apollo parent resolver
 * @param {string} { userID } id of a user
 * @param {express.Request} { req } request object from the context
 * @return {request: Request} request
 */
const sendFriendRequest = async (_, { userID }, { req }) => {
  const user = authenticateHTTP(req);
  if (!user.emailVerified) throw new ApolloError('Not verified');

  if (userID === user.id)
    throw new UserInputError('Action invalid', {
      sendOwnRequest: 'Cannot send requests to yourself',
    });

  let fRequest = null;

  // prevent duplicates
  fRequest = await Request.findOne({
    fromUser: user.id,
    toUser: userID,
  });

  if (fRequest) {
    throw new UserInputError('Duplicate request', {
      errors: {
        alreadySent: 'Request already sent',
      },
    });
  }

  /**
   * @type {Request}
   */
  // TODO: resolve mutual requests?
  const request = new Request({
    fromUser: user.id,
    toUser: userID,
    type: 'friendshipRequest',
    createdAt: new Date().toISOString(),
  });

  await request.save();
  await request
    .populate('fromUser', 'id username')
    .populate('toUser', 'id username')
    .execPopulate();
  return request;
};

module.exports = sendFriendRequest;
