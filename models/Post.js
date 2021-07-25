const { model, Schema } = require('mongoose');

/**
 * Post
 *
 * @typedef Post
 * @property {string} body
 * @property {string} username
 * @property {string} createdAt
 * @property {string} imageURL
 * @property {string} editedAt
 * @property {Array<Schema.Types.ObjectId>} comments
 * @property {Array<Schema.Types.ObjectId>} likes
 * @property {Schema.Types.ObjectId} user
 * @property {Schema.Types.ObjectId} project
 */
const PostSchema = new Schema({
  body: String,
  username: String,
  createdAt: String,
  // NOTE: potentially a separate model?
  // TODO: set up a default image path
  imageURL: String,
  editedAt: String,
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
    },
  ],
  likes: [
    {
      username: String,
      createdAt: String,
    },
  ],
  // relationship connection
  // ref used for populate method in mongoose
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
  },
});

module.exports = model('Post', PostSchema);
