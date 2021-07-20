const { UserInputError } = require('apollo-server-express');

/**
 * custom apollo error to be thrown for nonexistent entries in the db
 *
 * @class NonexistentError
 * @extends {UserInputError}
 */
class NonexistentError extends UserInputError {
  /**
   * Creates an instance of NonexistentError.
   * @param {{name: string, id: string}} { name, id } of the searched items
   * @param {string} [payload={ nonexistentItem: `Cannot find ID:${id}` }]
   * @memberof NonexistentError
   */
  constructor(
    { name, id },
    payload = { nonexistentItem: `Cannot find ID:${id}` }
  ) {
    super(`Nonexistent ${name}`, { errors: payload });
  }
}

module.exports = NonexistentError;
