const jwt = require('jsonwebtoken');
const { AuthenticationError } = require('apollo-server-express');

/**
 * @function authenticateHTTP authenticates HTTP requests
 *
 * @param {express.Request} req nodejs HTTP request object
 * @throws {AuthenticationError} when token doesn't exist/is invalid/has expired
 * @return {Object}  decoded user and token info
 */
const authenticateHTTP = (req) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    // get the bearer token
    const token = authHeader.split('Bearer ')[1];
    if (token) {
      try {
        const user = jwt.verify(token, process.env.SECRET);
        return user;
      } catch (error) {
        throw new AuthenticationError('Invalid/Expired token');
      }
    }
    throw new AuthenticationError(
      'Authentication token must be a Bearer token'
    );
  }
  throw new AuthenticationError('Authorization header must be provided');
};

module.exports = authenticateHTTP;
