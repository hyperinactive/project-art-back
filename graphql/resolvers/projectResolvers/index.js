const Query = require('./projectQueries');
const Mutation = require('./projectMutations');

const projectResolver = {
  Query,
  Mutation,
};

module.exports = projectResolver;
