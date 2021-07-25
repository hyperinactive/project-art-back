const jwt = require('jsonwebtoken');

/**
 * @function generateToken signs jwt tokens

 * @param {User} user User object
 */
const generateToken = (user) =>
  jwt.sign(
    {
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
      username: user.username,
      role: user.role,
      imageURL: user.imageURL,
    },
    process.env.SECRET,
    {
      expiresIn: '1h',
    }
  );

/**
 * @function generateRandomCode generates a random 4 digit number
 *
 * @param {number} [min=1000] optional min value
 * @param {number} [max=10000] optional max value
 * @returns {number} random 4 digit number
 */
const generateRandomCode = (min = 1000, max = 10000) =>
  Math.floor(Math.random() * (max - min) + min).toString();

module.exports = { generateToken, generateRandomCode };
