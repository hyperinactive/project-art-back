const jwt = require('jsonwebtoken');

const authenticate = (connection) => {
  if (connection && connection.context.Authorization) {
    try {
      const token = connection.context.Authorization.split('Bearer ')[1];
      if (token) {
        return jwt.verify(token, process.env.SECRET);
      }
      throw new Error('Authentication token must provided');
      // if jwt verified the token then all is good
      // TODO: might need to get the user from the token
    } catch (error) {
      throw new Error('Invalid/Expired token');
    }
  } else {
    throw new Error('Missing connection object');
  }
};

module.exports = authenticate;
