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
    // get the latest messages to "init" the cache on the front end
    // only to be called on the first load of the inbox component
    // to view older messages users will user the feed query to fetch them and update the cache
    getUserMessages: async (_, __, { req }) => {
      const user = authenticateHTTP(req);
      const limit = 30;

      try {
        const { friends } = await User.findById(user.id).populate(
          'friends',
          'id username imageURL'
        );

        // yes, I'm a mediocre dev at best, okay? At least it works
        // looping over the friend list twice (type def expects an array but I need user keys) and populate the map with user info
        // simple push to array doesn't work here cause messages can be received out of fetch order
        // ugly, but avoids problems with adding messages asynchronously
        const res = {};
        Object.entries(friends).forEach((entry) => {
          res[entry[1].id] = {
            id: entry[1].id,
            username: entry[1].username,
            imageURL: entry[1].imageURL,
          };
        });

        // fill the messages fields with promises (and latestMessage too)
        // latestMessages have an extra db query, I know, I know...
        Object.entries(friends).forEach((entry) => {
          const pair = [user.id, entry[1].id];
          res[entry[1].id].messages = new Promise((resolve, reject) => {
            try {
              const messages = Message.find({
                fromUser: { $in: pair },
                toUser: { $in: pair },
              })
                .populate('toUser', 'id username')
                .populate('fromUser', 'id username')
                .limit(limit)
                .sort({ createdAt: -1 });
              resolve(messages);
            } catch (error) {
              console.log(error);
              reject(error);
            }
          });
          res[entry[1].id].latestMessage = new Promise((resolve, reject) => {
            try {
              const latestMessage = Message.findOne({
                fromUser: { $in: pair },
                toUser: { $in: pair },
              })
                .populate('toUser', 'id username')
                .populate('fromUser', 'id username')
                .sort({ createdAt: -1 });

              resolve(latestMessage);
            } catch (error) {
              console.log(error);
              reject(error);
            }
          });
        });

        const normalizedRes = [];
        Object.entries(res).forEach((entry) => {
          normalizedRes.push({
            user: {
              id: entry[1].id,
              username: entry[1].username,
              imageURL: entry[1].imageURL,
            },
            messages: entry[1].messages,
            latestMessage: entry[1].latestMessage,
          });
        });

        return normalizedRes;
      } catch (error) {
        // console.log(error);
        throw new Error(error);
      }
    },
    getUserMessagesFeed: async (_, { userID, cursorTimestamp }, { req }) => {
      authenticateHTTP(req);
      const limit = 20;

      try {
        const fUser = await User.findById(userID);
        if (!fUser) throw new Error('UserID....');

        let messages = [];
        if (cursorTimestamp !== undefined) {
          messages = await Message.find({
            createdAt: { $lt: cursorTimestamp },
            $or: [{ toUser: userID }, { fromUser: userID }],
          })
            .populate('fromUser', 'id username')
            .populate('toUser', 'id username')
            .sort({ createdAt: -1 })
            .limit(limit + 1)
            .exec();
        } else {
          messages = await Message.find({
            $or: [{ toUser: userID }, { fromUser: userID }],
          })
            .populate('fromUser', 'id username')
            .populate('toUser', 'id username')
            .limit(limit + 1)
            .sort({ createdAt: -1 })
            .exec();
        }

        const hasMoreItems = messages.length === limit + 1;
        messages.pop();

        return {
          messages,
          hasMoreItems,
          nextCursor:
            messages[messages.length - 1] > 0
              ? messages[messages.length - 1].createdAt
              : null,
        };
      } catch (error) {
        throw new ApolloError('InternalError', { error });
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

        let hasFriendBool = false;
        Object.entries(recipient.friends).forEach((friend) => {
          if (friend[1].toString() === user.id.toString()) {
            hasFriendBool = true;
          }
        });

        if (!hasFriendBool) {
          throw new UserInputError('No friendship, no messaging');
        }

        /**
         * @type {Message}
         */
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
        throw new ApolloError('InternalError', { err });
      }
    },
  },
  // TODO: Cannot have more than one Subscription field??? WTF APOLLO
  // read up on this and structire the code later
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
    newPost: {
      subscribe: withFilter(
        (_, __, { pubsub, connection }) => {
          authenticateSocket(connection);
          return pubsub.asyncIterator(['NEW_POST']);
        },
        async ({ newPost }, __, { connection }) => {
          const user = authenticateSocket(connection);
          try {
            const fUser = await User.findById(user.id);
            if (!fUser) throw new UserInputError('Wrong user ID');

            for (let i = 0; i < fUser.projects.length; i++) {
              if (fUser.projects[i].toString() === newPost.project.toString()) {
                return true;
              }
            }

            return false;
          } catch (error) {
            throw new ApolloError(error);
          }
        }
      ),
    },
  },
};

module.exports = messageResolver;
