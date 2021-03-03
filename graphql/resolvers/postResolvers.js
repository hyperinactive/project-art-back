const {
  AuthenticationError,
  UserInputError,
} = require('apollo-server-express');

const Post = require('../../models/Post');
const checkAuth = require('../../utils/checkAuth');
const { validatePostInput } = require('../../utils/validators');

const postResolver = {
  Query: {
    getPosts: async () => {
      try {
        const posts = await Post.find({})
          .populate('comments')
          .populate('user')
          .sort({ createdAt: -1 })
          .exec();

        return posts;
      } catch (error) {
        throw new Error(error);
      }
    },
    getPost: async (_, { postID }) => {
      try {
        const post = await (
          await Post.findById(postID).populate('comments')
        ).execPopulate();

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
      const user = checkAuth(context);
      const { valid, errors } = validatePostInput(body);

      if (!valid) {
        throw new UserInputError('Errors', { errors });
      }
      try {
        const newPost = new Post({
          body,
          user: user.id, // since the token only has id, we can't pass the user object without querying for it
          username: user.username,
        });

        const res = await newPost.save();

        // subscription part
        // after the creation of a post we want to send it with the keyword NEW_POST to all subscribers
        // context.pubSub.publish('NEW_POST', {
        //   newPost: res,
        // });

        return res;
      } catch (error) {
        throw new Error(error, { errors });
      }
    },
    deletePost: async (_, { postID }, context) => {
      const user = checkAuth(context);

      try {
        const post = await Post.findById(postID);

        // check the ownership over the post
        if (user.username === post.username) {
          await post.delete();
          return 'Post deleted successfully';
        }
        throw new AuthenticationError('Not allowed');
      } catch (error) {
        throw new Error(error);
      }
    },
    likeTogglePost: async (_, { postID }, context) => {
      const { username } = checkAuth(context);

      const post = await Post.findById(postID);

      if (post) {
        // had already liked the post
        if (post.likes.find((like) => like.username === username)) {
          // remove the like with our username
          post.likes = post.likes.filter((like) => like.username !== username);
          // about to like the post
        } else {
          post.likes.push({
            username,
            createdAt: new Date(Date.now()).toISOString(),
          });
        }
        await post.save();
        return post;
      }

      throw new UserInputError('Post not found');
    },
  },
  Subscription: {
    // creating a subscription that listens to a keyword NEW_POST
    newPost: (_, __, { pubSub }) => pubSub.asyncIterator('NEW_POST'),
  },
};

module.exports = postResolver;
