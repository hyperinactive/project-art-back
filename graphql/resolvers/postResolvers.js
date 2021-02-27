const Post = require('../../models/Post');
const checkAuth = require('../../utils/checkAuth');

const postResolver = {
  Query: {
    getPosts: async () => {
      try {
        const posts = await Post.find().sort({ createdAt: -1 });
        return posts;
      } catch (error) {
        throw new Error(error);
      }
    },
    getPost: async (_, { postID }) => {
      try {
        const post = await Post.findById(postID);

        if (post) {
          return post;
        }
        throw new Error('Post not found');
      } catch (error) {
        throw new Error(error);
      }
    },
  },
  Mutation: {
    // we're using the contex here, it contains the request object
    createPost: async (_, { body }, context) => {
      // TODO: do the creation
      const user = checkAuth(context);

      const newPost = new Post({
        body,
        user: user.id,
        username: user.username,
        createdAt: Date.now().toString(),
      });

      const res = await newPost.save();

      return res;
    },
  },
};

module.exports = postResolver;
