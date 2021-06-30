/* eslint-disable consistent-return */
const {
  UserInputError,
  ApolloError,
  withFilter,
} = require('apollo-server-express');

const authenticateHTTP = require('../../utils/authenticateHTTP');
const authenticateSocket = require('../../utils/authenticateSocket');
const Message = require('../../models/Message');
const User = require('../../models/User');

const messageResolver = {
  Query: {
    getMessages: async (_, { toUserID }, { req }) => {
      const user = authenticateHTTP(req);

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
    sendMessage: async (_, { toUserID, content }, { req, pubsub }) => {
      const user = authenticateHTTP(req);
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

        pubsub.publish('NEW_MESSAGE', { newMessage: message });

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

      // check if the message is being sent to an authenticated user which is the reciever of it
      subscribe: withFilter(
        (_, __, { pubsub, connection }) => {
          authenticateSocket(connection);
          return pubsub.asyncIterator(['NEW_MESSAGE']);
        },
        ({ newMessage }, __, { connection }) => {
          const user = authenticateSocket(connection);
          if (newMessage.toUser.id === user.id) {
            return true;
          }
          return false;
        }
      ),
    },
  },
};

module.exports = messageResolver;
