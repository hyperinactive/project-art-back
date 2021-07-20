const { AuthenticationError, ApolloError } = require('apollo-server-express');
const { UserInputError } = require('apollo-server-express');

const authenticateHTTP = require('../../utils/authenticateHTTP');
const Comment = require('../../models/Comment');
const Post = require('../../models/Post');

const commentResolver = {
  Query: {
    getComments: async (_, { postID }, { req }) => {
      const user = authenticateHTTP(req);

      const post = await Post.findById(postID);

      if (!post) throw new UserInputError("Post doesn't exist");
      await post
        .populate({
          path: 'project',
          populate: [
            {
              path: 'members',
              select: 'id',
            },
          ],
        })
        .execPopulate();
      if (!post.project.members.find((member) => member.id === user.id))
        throw new AuthenticationError('Action not allowed');

      await post
        .populate('comments')
        .populate({
          path: 'comments',
          populate: [
            {
              path: 'user',
              model: 'User',
            },
          ],
        })
        .execPopulate();
      return post.comments;
    },
  },
  Mutation: {
    createComment: async (_, { postID, body }, { req }) => {
      const user = authenticateHTTP(req);
      const errors = {};

      if (body.trim() === '') errors.body = 'Comments must not be empty';
      if (body.length > 150)
        errors.bodyLength = 'Comments cannot be longer than 200 characters';

      if (Object.keys(errors).length > 0)
        throw new ApolloError('InputValidationError', 'INVALID_INPUT', {
          errors,
        });

      try {
        const post = await (
          await Post.findById(postID).populate('comments')
        ).execPopulate();

        if (post) {
          /**
           * @type {Comment}
           */
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
        throw new ApolloError('InternalError', { error });
      }
    },
    deleteComment: async (_, { postID, commentID }, { req }) => {
      const { username } = authenticateHTTP(req);

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
        throw new ApolloError('InternalError', { error });
      }
    },
  },
};

module.exports = commentResolver;
