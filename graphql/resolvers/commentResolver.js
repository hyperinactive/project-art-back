const {
  UserInputError,
  AuthenticationError,
} = require('apollo-server-express');

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
    deleteComment: async (_, { postID, commentID }, context) => {
      // get the username from the context
      const { username } = checkAuth(context);

      const post = await Post.findById(postID);
      console.log(post);

      // find the index of the comment
      if (post) {
        const commentIndex = post.comments.findIndex(
          (comment) => comment.id === commentID
        );

        // check the owenership
        if (post.comments[commentIndex].username === username) {
          post.comments.splice(commentIndex, 1);
          await post.save();
          return post;
        }
        // these errors don't have a payload of errors cause we don't expect
        // clients to have access to these things, eg. there will be no button to delete comments you don't own
        // this is a safety check
        throw new AuthenticationError('Action not allowed');

        // case no post has been found
      } else {
        throw new UserInputError('Post not found');
      }
    },
  },
};

module.exports = commentResolver;
