const postResolvers = require('./postResolvers');
const userResolvers = require('./userResolvers');
const commentResolvers = require('./commentResolver');
const projectResolvers = require('./projectResolvers.js');

module.exports = {
  Post: {
    // after doing the queries, mutations etc
    // this will trigger
    // parent argument is the stuff we return from the resolvers
    // since posts are being returned, we just pass the length or its arrays
    likeCount: (parent) => parent.likes.length,
    commentCount: (parent) => parent.comments.length,
  },
  // TODO: could save some coputation, return to this
  // PostsChunkResponse: {
  //   hasMoreItems: (parent) => parent.posts.length < skip + limit,
  // },
  Project: {
    memberCount: (parent) => parent.members.length,
  },
  Query: {
    ...postResolvers.Query,
    ...userResolvers.Query,
    ...projectResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...postResolvers.Mutation,
    ...commentResolvers.Mutation,
    ...projectResolvers.Mutation,
  },
  // Subscription: {
  //   ...postResolvers.Subscription,
  // },
};
