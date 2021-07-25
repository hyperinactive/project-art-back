const { AuthenticationError } = require('apollo-server-express');
const jwt = require('jsonwebtoken');

/**
 * @function authenticateSocket authenticates Socket connection
 *
 * @param {Object} connection apollo's object containing connection info
 * @throws {AuthenticationError} when token doesn't exist/is invalid/has expired
 * @return {Object} decoded user and token info
 */
const authenticateSocket = (connection) => {
  if (connection && connection.context.Authorization) {
    try {
      const token = connection.context.Authorization.split('Bearer ')[1];
      if (token) {
        return jwt.verify(token, process.env.SECRET);
      }
      throw new AuthenticationError('Authentication token must provided');
      // if jwt verified the token then all is good
      // TODO: might need to get the user from the token
    } catch (error) {
      throw new AuthenticationError('Invalid/Expired token');
    }
  } else {
    throw new AuthenticationError('Missing connection object');
  }
};

module.exports = authenticateSocket;
