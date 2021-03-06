const { model, Schema } = require('mongoose');

// since we're using graphql
// and we've got restrictions there
// there is no need to implement them here
const userSchema = new Schema({
  username: String,
  password: String,
  email: String,

  // TODO: for email identification, hopefully soon
  emailVerified: {
    type: Boolean,
    defautl: false,
  },
  status: {
    type: String,
    default: 'lurk, lurk',
  },
  skills: [
    {
      skill: String,
    },
  ],
  interests: [
    {
      interest: String,
    },
  ],
  createdAt: String,
  projectsJoined: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Project',
    },
  ],
  projectsCreated: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Project',
    },
  ],
  friends: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  role: {
    type: String,
    enum: ['member', 'admin', 'developer'],
    default: 'member',
  },
});

module.exports = model('User', userSchema);
