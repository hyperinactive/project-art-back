const { model, Schema } = require('mongoose');

/**
 * User
 *
 * @typedef {Object} User
 * @property {string} username
 * @property {string} email
 * @property {boolean} emailVerified
 * @property {string} status
 * @property {string} skills
 * @property {string} imageURL
 * @property {string} createdAt
 * @property {Array<Schema.Types.ObjectId>} projects
 * @property {Array<Schema.Types.ObjectId>} friends
 * @property {string} role
 */
const UserSchema = new Schema({
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
    default: false,
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

module.exports = model('User', UserSchema);
