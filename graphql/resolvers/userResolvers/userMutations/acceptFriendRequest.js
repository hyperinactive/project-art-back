const { UserInputError } = require('apollo-server-express');

const Request = require('../../../../models/Request');
const User = require('../../../../models/User');
const authenticateHTTP = require('../../../../utils/authenticateHTTP');

const acceptFriendRequest = async (_, { requestID }, { req }) => {
  const user = authenticateHTTP(req);

  const request = await Request.findById(requestID);
  if (!request)
    throw new UserInputError('Nonexistent request', 'Request already exists');

  if (request.fromUser === user.id)
    throw new UserInputError('Action not valid', {
      acceptOwnRequest: 'Cannot accept your own requests',
    });

  const sender = await User.findById(request.fromUser);
  if (!sender) throw new UserInputError('Nonexistent user');

  const receiver = await User.findById(user.id);
  if (!receiver) throw new UserInputError('Nonexistent user');

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
