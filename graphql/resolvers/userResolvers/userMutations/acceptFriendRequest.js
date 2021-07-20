const Request = require('../../../../models/Request');
const User = require('../../../../models/User');
const authenticateHTTP = require('../../../../utils/authenticateHTTP');
const InvalidActionError = require('../../../../utils/errors/InvalidActionError');
const NonexistentError = require('../../../../utils/errors/NonexistentError');

const acceptFriendRequest = async (_, { requestID }, { req }) => {
  const user = authenticateHTTP(req);

  const request = await Request.findById(requestID);
  if (!request) throw new NonexistentError({ name: 'request', id: requestID });

  if (request.fromUser === user.id)
    throw new InvalidActionError({
      acceptOwnRequest: 'Cannot accept your own requests',
    });

  const sender = await User.findById(request.fromUser);
  if (!sender)
    throw new NonexistentError({ name: 'user', id: request.fromUser });

  const receiver = await User.findById(user.id);
  if (!receiver) throw new NonexistentError({ name: 'user', id: user.id });

  receiver.friends.push(sender.id);
  sender.friends.push(receiver.id);
  await receiver.save();
  await sender.save();

  const fRequest = await Request.findByIdAndDelete(requestID);
  return {
    sender,
    receiver,
    request: fRequest,
  };
};

module.exports = acceptFriendRequest;
