const { Schema, model } = require('mongoose');

/**
 * Request
 *
 * @typedef {Object} Request
 * @property {string} createdAt
 * @property {Schema.Types.ObjectId} toUser
 * @property {Schema.Types.ObjectId} fromUser
 * @property {string} type
 * @property {Schema.Types.ObjectId} project
 */
const RequestSchema = new Schema({
  createdAt: {
    type: String,
    required: true,
    default: new Date().toISOString(),
  },
  fromUser: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  toUser: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  type: {
    type: String,
    enum: ['friendshipRequest', 'projectRequest'],
    required: true,
  },
  // only populated on projectRequests
  // TODO: some refPath shenanigans?
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
  },
});

module.exports = model('Request', RequestSchema);
