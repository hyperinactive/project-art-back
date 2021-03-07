const { model, Schema } = require('mongoose');

// since we're using graphql
// and we've got restrictions there
// there is no need to implement them here
const userSchema = new Schema({
  username: String,
  password: String,
  email: String,
  emailVerified: Boolean, // TODO: for email identification, hopefully soon
  createdAt: String,
  projectsJoined: [
    {
      type: Schema.Types.ObjectId,
      ref: 'ProjectGroup',
      joinedAt: String,
    },
  ],
  projectsCreated: [
    {
      type: Schema.Types.ObjectId,
      ref: 'ProjectGroup',
      joinedAt: String,
    },
  ],
  friends: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
      joinedAt: String,
    },
  ],
  role: {
    type: String,
    enum: ['member', 'admin', 'developer'],
    default: 'member',
  },
});

module.exports = model('User', userSchema);
