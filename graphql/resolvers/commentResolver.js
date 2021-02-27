const { UserInputError } = require('apollo-server-express');

const Post = require('../../models/Post');
const checkAuth = require('../../utils/checkAuth');

const commentResolver = {
  Mutation: {
    createComment: async (_, { postID, body }, context) => {
      const user = checkAuth(context);

      if (body.trim() === '') {
        throw new UserInputError('Empty comment', {
          errors: {
            body: 'Comments must not be empty',
          },
        });
      }

      const post = await Post.findById(postID);

      // NOTE: not using the comments or likes as separate models
      if (post) {
        post.comments.unshift({
          body,
          username: user.username,
          createdAt: Date.now().toString(),
        });

        await post.save();
        return post;
      }
      throw new UserInputError('Post not found');
    },
  },
};

module.exports = commentResolver;
