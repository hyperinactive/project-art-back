const { UserInputError } = require('apollo-server-express');

class InvalidActionError extends UserInputError {
  /**
   * Creates an instance of InvalidActionError.
   * @param {Object.<string, string>} payload payload object containing key:value error pairs
   * @memberof InvalidActionError
   */
  constructor(payload) {
    // (message, error payload)
    super('Invalid action', { errors: payload });
  }
}

module.exports = InvalidActionError;
