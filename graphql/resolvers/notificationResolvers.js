/* eslint-disable no-unused-vars */
const { ApolloError } = require('apollo-server-express');
const FeedItem = require('../../models/Notification');
const authenticateHTTP = require('../../utils/authenticateHTTP');

const notificationResolvers = {
  Query: {},
  Mutation: {},
};

module.exports = notificationResolvers;
