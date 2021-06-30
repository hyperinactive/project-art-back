/* eslint-disable consistent-return */
const { UserInputError, ApolloError } = require('apollo-server-express');

const checkAuth = require('../../utils/checkAuth');
const Message = require('../../models/Message');
const User = require('../../models/User');

const messageResolver = {
  Query: {
    getMessages: async (_, { toUserID }, context) => {
      const user = checkAuth(context);

      try {
        const recipient = await User.findById(toUserID);
        if (!recipient) throw new UserInputError('User not found');
        if (recipient.id === user.id)
          throw new UserInputError("You're not even supposed to make these");

        const pair = [user.id, toUserID];
        const messages = await Message.find({
          fromUser: { $in: pair },
          toUser: { $in: pair },
        })
          .populate('toUser', 'id username')
          .populate('fromUser', 'id username');

        return messages;
      } catch (error) {
        console.log(error);
      }
    },
  },
  Mutation: {
    sendMessage: async (_, { toUserID, content }, context) => {
      const user = checkAuth(context);
      const errors = {};

      if (content.trim() === '')
        errors.messageEmpty = 'Message cannot be empty';

      if (content.length > 128)
        errors.messageLength = 'Max message length exceeded';

      // content will be handled on the client side, rest won't
      if (Object.keys(errors).length > 0)
        throw new ApolloError('InputValidationError', 'INVALID_INPUT', {
          errors,
        });

      try {
        const recipient = await User.findById(toUserID);
        if (!recipient) throw new UserInputError('User not found');
        if (recipient.id === user.id)
          throw new UserInputError('You really that lonely?');

        const message = new Message({
          toUser: recipient.id,
          fromUser: user.id,
          content: content.trim(),
          createdAt: new Date().toISOString(),
        });

        await message.save();
        await message
          .populate('toUser', 'id username')
          .populate('fromUser', 'id username')
          .execPopulate();

        context.pubsub.publish('NEW_MESSAGE', { newMessage: message });

        return message;
      } catch (err) {
        // some other internal error idk
        console.log(err);
      }
    },
  },
  Subscription: {
    newMessage: {
      // asyncIterator expects an array of event
      // NEW_MESSAGE event
      // sending data to all subbed clients
      subscribe: (_, __, context) =>
        context.pubsub.asyncIterator(['NEW_MESSAGE']),
    },
  },
};

module.exports = messageResolver;
