const { Schema, model } = require('mongoose');

/**
 * Message
 *
 * @typedef Message
 * @property {string} content
 * @property {string} createdAt
 * @property {Schema.Types.ObjectId} fromUser
 * @property {Schema.Types.ObjectId} toUser
 */
const MessageSchema = new Schema({
  content: String,
  createdAt: String,
  fromUser: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  toUser: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
});

module.exports = model('Message', MessageSchema);
