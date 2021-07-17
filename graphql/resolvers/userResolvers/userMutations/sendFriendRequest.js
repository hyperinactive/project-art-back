const { ApolloError, UserInputError } = require('apollo-server-express');

const Request = require('../../../../models/Request');
const authenticateHTTP = require('../../../../utils/authenticateHTTP');

const sendFriendRequest = async (_, { toUserID }, { req }) => {
  const user = authenticateHTTP(req);
  if (!user.emailVerified) throw new ApolloError('Not verified');

  if (toUserID === user.id)
    throw new UserInputError('Action invalid', {
      sendOwnRequest: 'Cannot send requests to yourself',
    });

  let fRequest = null;

  try {
    // prevent duplicates
    fRequest = await Request.findOne({
      fromUser: user.id,
      toUser: toUserID,
    });

    if (fRequest)
      throw new UserInputError('Request already sent', {
        alreadySent: 'Request already sent',
      });
  } catch (error) {
    throw new ApolloError('Internal error', { error });
  }

  console.log('here');
  // TODO: resolve mutual requests?
  const request = new Request({
    fromUser: user.id,
    toUser: toUserID,
    type: 'friendshipRequest',
  });

  await request.save();
  return request;
};

module.exports = sendFriendRequest;
