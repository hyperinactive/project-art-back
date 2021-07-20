const {
  AuthenticationError,
  UserInputError,
  ApolloError,
} = require('apollo-server-express');
const uuid = require('uuid');

const Post = require('../../../models/Post');
const Project = require('../../../models/Project');
const authenticateHTTP = require('../../../utils/authenticateHTTP');
const { uploadFile } = require('../../../utils/storage');
const allowedImageTypes = require('../../../utils/types');

const Mutation = {
  /**
   * @function deletePost deletes a post
   *
   * @param {function} _ apollo parent resolver
   * @param {string} { postID }
   * @param {Express.Request} { req }
   * @return {*}
   */
  deletePost: async (_, { postID }, { req }) => {
    const user = authenticateHTTP(req);
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
      throw new ApolloError('InternalError', { error });
    }
  },
  likeTogglePost: async (_, { postID }, { req }) => {
    const { username } = authenticateHTTP(req);

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
  createProjectPost: async (_, { projectID, body, image }, { req, pubsub }) => {
    const errors = {};
    const user = authenticateHTTP(req);
    const project = await Project.findById(projectID).populate('members');
    if (!project) {
      errors.project404 = "Project doesn't exist";
      throw new UserInputError("Project doesn't exists", { errors });
    }

    if (!project.members.find((member) => member.id === user.id)) {
      errors.notAMember = 'Members only action';
      throw new AuthenticationError('Action not allowed', { errors });
    }

    if (body.trim() === '') {
      errors.body = "Body can't be empty";
      throw new UserInputError("Body can't be empty", { errors });
    }

    let imageURL;
    if (image) {
      const { createReadStream, mimetype } = await image;

      if (!Object.values(allowedImageTypes).find((type) => type === mimetype)) {
        errors.allowedType = 'File type not allowed';
        throw new UserInputError('File type not allowed', { errors });
      }

      const key = `${uuid.v4()}.${mimetype.split('/')[1]}`;

      try {
        await uploadFile(createReadStream, key);
        // imageURL = `http://localhost:4000/${key}`;
        imageURL = key;
      } catch (error) {
        throw new Error('Error uploading the file', error);
      }
    } else {
      imageURL = null;
    }

    /**
     * @type {Post}
     */
    const newPost = new Post({
      body,
      user: user.id, // since the token only has id, we can't pass the user object without querying for it
      project: project.id,
      username: user.username,
      createdAt: new Date().toISOString(),
      imageURL,
      editedAt: '',
    });

    const res = await newPost.save();
    project.posts.push(res);
    await project.save();
    await res.populate('user', 'id username imageURL status').execPopulate();

    pubsub.publish('NEW_POST', { newPost });

    return res;
  },
  // TODO: image edit
  editPost: async (_, { postID, body }, { req }) => {
    const user = authenticateHTTP(req);
    const errors = {};
    // TODO: resolve on client side
    if (body.trim() === '') {
      errors.body = 'Empty body';
      throw new UserInputError('User Input error', { errors });
    }

    let post = null;
    try {
      post = await Post.findById(postID);

      if (!post) {
        throw new UserInputError('Nonexistent post');
      }

      if (post.user.toString() !== user.id.toString()) {
        throw new UserInputError('Action not allowed');
      }
      post.editedAt = new Date().toISOString();
      post.body = body;

      await post.save();

      return post;
    } catch (error) {
      throw new ApolloError(error);
    }
  },
};

module.exports = Mutation;
