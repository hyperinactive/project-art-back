const jwt = require('jsonwebtoken');

// generate a token
// res contains the user data
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

const generateRandomCode = (min = 1000, max = 10000) =>
  Math.floor(Math.random() * (max - min) + min).toString();

module.exports = { generateToken, generateRandomCode };
