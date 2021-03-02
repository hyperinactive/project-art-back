const { model, Schema } = require('mongoose');

const commentSchema = new Schema({
  body: String,
  username: String,
  createdAt: {
    type: String,
    default: new Date(Date.now()).toISOString(),
  },
  post: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
});

module.exports = model('Comment', commentSchema);
