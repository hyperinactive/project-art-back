const Query = require('./postQueries');
const Mutation = require('./postMutations');

const postResolver = {
  Query,
  Mutation,
  Subscription: {
    // creating a subscription that listens to a keyword NEW_POST
    newPost: (_, __, { pubSub }) => pubSub.asyncIterator('NEW_POST'),
  },
};

module.exports = postResolver;
