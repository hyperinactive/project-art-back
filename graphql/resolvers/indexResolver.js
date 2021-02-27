const postResolvers = require('./postResolvers');
const userResolvers = require('./userResolvers');

module.exports = {
  Query: {
    ...postResolvers.Query,
  },
  Mutations: {
    ...userResolvers.Mutations,
  },
};
