const { UserInputError } = require('apollo-server-express');

class NonexistentError extends UserInputError {
  constructor(item, properties = { message: `Cannot find ID:${item[1]}` }) {
    super(`Nonexistent ${item[0]}`, properties);
  }
}

module.exports = NonexistentError;
