const { model, Schema } = require('mongoose');

const postSchema = new Schema({
  body: String,
  username: String,
  createdAt: String,
  // NOTE: potentially a separate model?
  // TODO: set up a default image path
  imageURL: String,
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

module.exports = model('Post', postSchema);
