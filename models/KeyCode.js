const { model, Schema } = require('mongoose');

/**
 * KeyCode
 *
 * @typedef {Object} KeyCode
 * @property {string} code
 * @property {string} createdAt
 * @property {string} expires
 * @property {Schema.Types.ObjectId} user
 */
const KeyCodeSchema = {
  code: String,
  createdAt: String,
  expires: String,
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
};

module.exports = model('KeyCode', KeyCodeSchema);
