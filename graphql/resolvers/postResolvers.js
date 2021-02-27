const Post = require('../../models/Post');

const postResolver = {
  Query: {
    hello: () => 'Hello world!',
    getPosts: async () => {
      try {
        const posts = await Post.find();
        return posts;
      } catch (error) {
        throw new Error(error);
      }
    },
  },
};

module.exports = postResolver;
