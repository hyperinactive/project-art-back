const postResolvers = require('./postResolvers');
const userResolvers = require('./userResolvers');
const commentResolvers = require('./commentResolvers');
const projectResolvers = require('./projectResolvers');
const commentResolver = require('./commentResolvers');
const messageResolvers = require('./messageResolvers');
const requestResolvers = require('./requestResolvers');

module.exports = {
  Post: {
    // after doing the queries, mutations etc
    // this will trigger
    // parent argument is the stuff we return from the resolvers
    // since posts are being returned, we just pass the length or its arrays
    likeCount: (parent) => parent.likes.length,
    commentCount: (parent) => parent.comments.length,
  },
  Project: {
    memberCount: (parent) => parent.members.length,
  },
  Query: {
    ...postResolvers.Query,
    ...userResolvers.Query,
    ...projectResolvers.Query,
    ...commentResolver.Query,
    ...messageResolvers.Query,
    ...requestResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...postResolvers.Mutation,
    ...commentResolvers.Mutation,
    ...projectResolvers.Mutation,
    ...messageResolvers.Mutation,
    ...requestResolvers.Mutation,
  },
  Subscription: {
    ...messageResolvers.Subscription,
  },
};
