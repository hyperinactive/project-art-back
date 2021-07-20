const { model, Schema } = require('mongoose');

/**
 * Project
 *
 * @typedef {Object} Project
 * @property {string} name
 * @property {string} description
 * @property {string} createdAt
 * @property {Schema.Types.ObjectId} owner
 * @property {Array<Schema.Types.ObjectId>} moderators
 * @property {Array<Schema.Types.ObjectId>} members
 * @property {Array<Schema.Types.ObjectId>} posts
 */
const ProjectSchema = new Schema({
  name: String,
  description: String,
  createdAt: String,
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
  posts: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Post',
    },
  ],
});

module.exports = model('Project', ProjectSchema);
