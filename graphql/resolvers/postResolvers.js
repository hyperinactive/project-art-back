const {
  AuthenticationError,
  UserInputError,
} = require('apollo-server-express');
const uuid = require('uuid');

const Post = require('../../models/Post');
const Project = require('../../models/Project');
const checkAuth = require('../../utils/checkAuth');
const { validatePostInput } = require('../../utils/validators');
const { uploadFile } = require('../../utils/storage');
const allowedImageTypes = require('../../utils/types');

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
        const post = await Post.findById(postID)
          .populate('comments')
          .populate('user')
          .exec();

        if (post) {
          return post;
        }
        throw new Error('Post not found');
      } catch (error) {
        throw new Error(error);
      }
    },
    getPostsChunk: async (_, { limit, skip }) => {
      const skipDefault = skip === undefined ? 0 : skip;
      try {
        const itemCount = await Post.find({}).countDocuments();

        const posts = await Post.find({})
          .skip(skipDefault)
          .limit(limit)
          .populate('comments')
          .populate('user')
          .sort({ createdAt: -1 })
          .exec();

        // if there is no more to fetch additional field
        return {
          posts,
          hasMoreItems: itemCount >= skipDefault + limit,
        };
      } catch (error) {
        throw new Error(error);
      }
    },
    getProjectPosts: async (_, { projectID }, context) => {
      const user = checkAuth(context);
      const errors = {};
      try {
        const project = await Project.findById(projectID);
        if (!project) throw new Error("Project doesn't exist");

        await project.populate('members').execPopulate();
        if (!project.members.find((member) => member.id === user.id)) {
          errors.notAMember = 'Members only action';
          throw new AuthenticationError('Action not allowed', { errors });
        }

        const posts = await project.populate('comments').execPopulate();

        await posts
          .populate({
            path: 'posts',
            populate: {
              path: 'user',
            },
          })
          .execPopulate();

        return await posts.posts;
      } catch (error) {
        throw new Error('Error', error);
      }
    },
  },
  Mutation: {
    // testing upload
    uploadFile: async (_, { file }) => {
      if (!file) throw new UserInputError('File is empty');

      // destructuring the file, but since it is a promise we need the await keyword
      // const { createReadStream, filename, mimetype, encoding } = await file;
      const { createReadStream, filename } = await file;
      const key = `${uuid.v4()}${filename}`;

      try {
        await uploadFile(createReadStream, key);
      } catch (error) {
        throw new Error('Error uploading the file', error);
      }
      return {
        url: `http://localhost:3000/files/${key}`,
      };
    },

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
          createdAt: new Date().toISOString(),
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

        if (!post) {
          throw new Error('Uh oh', { message: 'no post' });
        }

        // check the ownership over the post
        if (user.username === post.username) {
          await post.delete();
          return post;
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
            createdAt: new Date().toISOString(),
          });
        }
        await post.save();
        return post;
      }

      throw new UserInputError('Post not found');
    },
    // TODO: to be the default way of posting stuff
    // as to not break the current app, it remains separate
    createProjectPost: async (_, { projectID, body, image }, context) => {
      const errors = {};
      const user = checkAuth(context);
      const project = await Project.findById(projectID).populate('members');
      if (!project) {
        errors.project404 = "Project doesn't exist";
        throw new UserInputError("Project doesn't exists", { errors });
      }

      if (!project.members.find((member) => member.id === user.id)) {
        errors.notAMember = 'Members only action';
        throw new AuthenticationError('Action not allowed', { errors });
      }

      let imageURL;
      if (image) {
        const { createReadStream, mimetype } = await image;

        if (
          !Object.values(allowedImageTypes).find((type) => type === mimetype)
        ) {
          errors.allowedType = 'File type not allowed';
          throw new UserInputError('File type not allowed', { errors });
        }

        const key = `${uuid.v4()}`;

        try {
          await uploadFile(createReadStream, key);
          imageURL = `http://localhost:4000/files/${key}`;
        } catch (error) {
          throw new Error('Error uploading the file', error);
        }
      } else {
        imageURL = null;
      }

      const newPost = new Post({
        body,
        user: user.id, // since the token only has id, we can't pass the user object without querying for it
        username: user.username,
        createdAt: new Date().toISOString(),
        imageURL,
      });

      const res = await newPost.save();
      project.posts.push(res);
      await project.save();
      await res.populate('user').execPopulate();
      return res;
    },
  },
  Subscription: {
    // creating a subscription that listens to a keyword NEW_POST
    newPost: (_, __, { pubSub }) => pubSub.asyncIterator('NEW_POST'),
  },
};

module.exports = postResolver;
