const { UserInputError, ApolloError } = require('apollo-server-express');

const authenticateHTTP = require('../../../../utils/authenticateHTTP');
const User = require('../../../../models/User');

// TODO: obviously we need to accept or decline these, placeholder code, LUL
const addFriend = async (_, { userID, username }, { req }) => {
  const user = authenticateHTTP(req);

  if (userID === undefined && username === undefined) {
    throw new Error('No data provided');
  }

  try {
    let receiver;
    if (userID !== undefined) {
      receiver = await User.findById(userID);
    } else {
      receiver = await User.findOne({ username });
    }

    const sender = await User.findById(user.id);

    if (!receiver) {
      throw new UserInputError('No user found');
    }

    if (
      receiver.friends.find(
        (friend) => friend.toString() === user.id.toString()
      )
    ) {
      throw new UserInputError('Already friends');
    }

    receiver.friends.push(user.id);
    sender.friends.push(receiver.id);
    await receiver.save();
    await sender.save();

    return {
      sender,
      receiver,
    };
  } catch (error) {
    console.log(error);
    throw new ApolloError('InternalError', { error });
  }
};

module.exports = addFriend;
