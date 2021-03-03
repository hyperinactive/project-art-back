const { model, Schema } = require('mongoose');

const postSchema = new Schema({
  body: String,
  username: String,
  createdAt: {
    type: String,
    // eslint-disable-next-line new-cap
    default: new Date().toISOString(),
  },
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
});

module.exports = model('Post', postSchema);
