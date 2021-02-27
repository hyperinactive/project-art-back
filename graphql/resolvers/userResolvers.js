const User = require('../../models/User');

const userResolvers = {
  Mutation: {
    // args is the input type (eg our registerInput)
    register(parent, args, context, info) {
      // user registration logic
    },
  },
};

module.exports = userResolvers;
