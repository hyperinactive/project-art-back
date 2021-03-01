const { model, Schema } = require('mongoose');

const projectGroupSchema = new Schema({
  name: String,
  description: String,
  passwordLocked: {
    type: Boolean,
    default: false,
  },
  password: String,
  createdAt: {
    type: String,
    default: Date.now().toString(),
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  moderators: [
    {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
  ],
  members: [
    {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
  ],
});

module.exports = model('ProjectGroup', projectGroupSchema);
