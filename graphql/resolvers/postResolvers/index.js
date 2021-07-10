const Query = require('./postQueries');
const Mutation = require('./postMutations');

const postResolver = {
  Query,
  Mutation,
};

module.exports = postResolver;
