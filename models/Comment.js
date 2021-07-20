const { model, Schema } = require('mongoose');

// TODO: leaving username when user is in relation to the comments is very dumb
// TODO: jsdoc correct way of documenting mongoose schema and models
/**
 * Comment
 *
 * @typedef {Object} Comment
 * @property {string} body
 * @property {string} username
 * @property {string} createdAt
 * @property {Schema.Types.ObjectId} post
 * @property {Schema.Types.ObjectId} user
 */
const CommentSchema = new Schema({
  body: String,
  username: String,
  createdAt: String,
  post: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
});

module.exports = model('Comment', CommentSchema);
