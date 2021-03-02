const { model, Schema } = require('mongoose');

const projectGroupSchema = new Schema({
  name: String,
  description: String,
  createdAt: {
    type: String,
    default: new Date(Date.now()).toISOString(),
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  moderators: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  members: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
});

module.exports = model('ProjectGroup', projectGroupSchema);