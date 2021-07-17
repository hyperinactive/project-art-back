const { Schema, model } = require('mongoose');

// dynamic requests
// invitations/requests && projects/users
const requestSchema = new Schema({
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

module.exports = model('ProjectRequest', requestSchema);
