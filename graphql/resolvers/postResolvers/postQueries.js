const { AuthenticationError } = require('apollo-server-express');
const Post = require('../../../models/Post');
const Project = require('../../../models/Project');
const checkAuth = require('../../../utils/checkAuth');

const Query = {
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
        .populate('project', 'id')
        .populate({
          path: 'project',
          populate: [
            {
              path: 'members',
              select: 'id',
            },
          ],
        })
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

      await project
        .populate({
          path: 'posts',
          populate: {
            path: 'user',
          },
        })
        .execPopulate();

      return project.posts;
    } catch (error) {
      throw new Error('Error', error);
    }
  },
};

module.exports = Query;
