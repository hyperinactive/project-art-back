const { model, Schema } = require('mongoose');

const projectGroupSchema = new Schema({
  name: String,
  description: String,
  passwordLocked: Boolean,
  password: String,
  createdAt: {
    type: String,
    default: Date.now().toString(),
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'owner',
  },
  moderators: [
    {
      type: Schema.Types.ObjectId,
      ref: 'mods',
    },
  ],
  members: [
    {
      type: Schema.Types.ObjectId,
      ref: 'members',
    },
  ],
});

module.exports = model('ProjectGroup', projectGroupSchema);
