/* eslint-disable consistent-return */
const { UserInputError } = require('apollo-server-express');

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

      try {
        if (content.trim() === '')
          errors.messageEmpty = 'Message cannot be empty';

        if (content.length > 256)
          errors.messageLength = 'Max message length exceeded';

        // content will be handled on the client side, rest won't
        if (Object.keys(errors).length > 0)
          throw new UserInputError('Input error', { errors });

        const recipient = await User.findById(toUserID);
        if (!recipient) throw new UserInputError('User not found');
        if (recipient.id === user.id)
          throw new UserInputError('You really that lonely?');

        const message = new Message({
          toUser: recipient.id,
          fromUser: user.id,
          content,
          createdAt: new Date().toISOString(),
        });

        await message.save();
        await message.populate('toUser').populate('fromUser').execPopulate();
        return message;
      } catch (err) {
        // some other internal error idk
        console.log(err);
      }
    },
  },
};

module.exports = messageResolver;
