const jwt = require('jsonwebtoken');
const { AuthenticationError } = require('apollo-server-express');

const authenticate = (req) => {
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
    throw new Error('Authentication token must be a Bearer token');
  }
  throw new Error('Authorization header must be provided');
};

module.exports = authenticate;
