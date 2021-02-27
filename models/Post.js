const { model, Schema } = require('mongoose');

const postSchema = new Schema({
  body: String,
  username: String, // done via simple string, maybe provide a model?
  createdAt: String, // default value to be set on the graphql side
  comments: [ // array of comments, perhaps make them a separate model?
    {
      body: String,
      username: String,
      createdAt: String,
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
    ref: 'users',
  },
});

module.exports = model('Post', postSchema);
