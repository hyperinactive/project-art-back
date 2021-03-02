const { model, Schema } = require('mongoose');

const postSchema = new Schema({
  body: String,
  username: String,
  createdAt: {
    type: String,
    default: new Date(Date.now()).toISOString(),
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
