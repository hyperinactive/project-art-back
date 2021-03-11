const {
  UserInputError,
  AuthenticationError,
} = require('apollo-server-express');

const checkAuth = require('../../utils/checkAuth');
const Comment = require('../../models/Comment');
const Post = require('../../models/Post');

// TODO: have comments contain other comments
const commentResolver = {
  Mutation: {
    createComment: async (_, { postID, body }, context) => {
      const user = checkAuth(context);

      try {
        if (body.trim() === '') {
          throw new UserInputError('Empty comment', {
            errors: {
              body: 'Comments must not be empty',
            },
          });
        }

        const post = await (
          await Post.findById(postID).populate('comments')
        ).execPopulate();

        if (post) {
          const comment = new Comment({
            body,
            user: user.id,
            username: user.username,
            createdAt: new Date().toISOString(),
          });

          // append the comment and save the changes
          await comment.save();
          post.comments.unshift(comment);
          await post.save();
          return comment;
        }
        throw new UserInputError('Post not found');
      } catch (error) {
        throw new Error(error);
      }
    },
    deleteComment: async (_, { postID, commentID }, context) => {
      const { username } = checkAuth(context);

      try {
        // get the username from the context

        const post = await (
          await Post.findById(postID).populate('comments', '_id')
        ).execPopulate();
        if (!post) throw new UserInputError('Post not found');

        const comment = await Comment.findById(commentID);
        if (!comment) throw new UserInputError('Comment not found');

        if (comment.username !== username)
          throw new AuthenticationError('Action not allowed');

        // remove the comment that matches the id
        post.comments.filter((currComment) => currComment.id !== commentID);
        await comment.delete();
        await post.save();
        return comment;
      } catch (error) {
        throw new Error(error);
      }
    },
  },
};

module.exports = commentResolver;
