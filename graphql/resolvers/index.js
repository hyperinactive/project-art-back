const postResolvers = require('./postResolvers');
const userResolvers = require('./userResolvers');
const commentResolvers = require('./commentResolver');
const projectGroupResolvers = require('./projectGroupResolvers.js');

module.exports = {
  Post: {
    // after doing the queries, mutations etc
    // this will trigger
    // parent argument is the stuff we return from the resolvers
    // since posts are being returned, we just pass the length or its arrays
    likeCount: (parent) => parent.likes.length,
    commentCount: (parent) => parent.comments.length,
  },
  Query: {
    ...postResolvers.Query,
    ...userResolvers.Query,
    ...projectGroupResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...postResolvers.Mutation,
    ...commentResolvers.Mutation,
    ...projectGroupResolvers.Mutation,
  },
  // Subscription: {
  //   ...postResolvers.Subscription,
  // },
};
