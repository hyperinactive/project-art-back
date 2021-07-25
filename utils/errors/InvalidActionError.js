const { UserInputError } = require('apollo-server-express');

/**
 * custom apollo error to be thrown for actions not meant to be called from client
 *
 * @class InvalidActionError
 * @extends {UserInputError}
 */
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
