const { model, Schema } = require('mongoose');

// since we're using graphql
// and we've got restrictions there
// there is no need to implement them here
const userSchema = new Schema({
  username: {
    type: String,
    unique: true, // index
  },
  email: {
    type: String,
    unique: true,
  },
  password: String,
  emailVerified: {
    type: Boolean,
    defautl: false,
  },
  status: {
    type: String,
    default: 'lurk, lurk',
  },
  skills: {
    type: String,
    default: 'very skilled YEP',
  },
  imageURL: String,
  interests: [
    {
      interest: String,
    },
  ],
  createdAt: String,
  projects: [
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
