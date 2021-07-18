const { ApolloError, UserInputError } = require('apollo-server-express');

const Request = require('../../../../models/Request');
const authenticateHTTP = require('../../../../utils/authenticateHTTP');

const sendFriendRequest = async (_, { userID }, { req }) => {
  const user = authenticateHTTP(req);
  if (!user.emailVerified) throw new ApolloError('Not verified');

  if (userID === user.id)
    throw new UserInputError('Action invalid', {
      sendOwnRequest: 'Cannot send requests to yourself',
    });

  let fRequest = null;

  try {
    // prevent duplicates
    fRequest = await Request.findOne({
      fromUser: user.id,
      toUser: userID,
    });

    if (fRequest)
      throw new UserInputError('Request already sent', {
        alreadySent: 'Request already sent',
      });
  } catch (error) {
    throw new ApolloError('Internal error', { error });
  }

  // TODO: resolve mutual requests?
  const request = new Request({
    fromUser: user.id,
    toUser: userID,
    type: 'friendshipRequest',
  });

  await request.save();
  await request
    .populate('fromUser', 'id username')
    .populate('toUser', 'id username')
    .execPopulate();
  return request;
};

module.exports = sendFriendRequest;
