const postResolvers = require('./postResolvers');
const userResolvers = require('./userResolvers');
const commentResolvers = require('./commentResolver');

module.exports = {
  Query: {
    ...postResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...postResolvers.Mutation,
    ...commentResolvers.Mutation,
  },
};
