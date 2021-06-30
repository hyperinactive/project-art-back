const {
  AuthenticationError,
  UserInputError,
} = require('apollo-server-express');
const Post = require('../../../models/Post');
const Project = require('../../../models/Project');
const authenticateHTTP = require('../../../utils/authenticateHTTP');

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
  getPostsFeed: async (_, { projectID, cursor, skip = 10 }, { req }) => {
    const user = authenticateHTTP(req);
    const errors = {};

    try {
      const project = await Project.findById(projectID);
      if (!project) throw new Error("Project doesn't exist");

      await project.populate('members').execPopulate();
      if (!project.members.find((member) => member.id === user.id)) {
        errors.notAMember = 'Members only action';
        throw new AuthenticationError('Action not allowed', { errors });
      }

      if (project.posts.length === 0) {
        return {
          res: [],
          hasMoreItems: false,
          cursor: null,
        };
      }

      await project.populate('posts').execPopulate();
      await project
        .populate({
          path: 'posts',
          populate: [
            {
              path: 'user',
              model: 'User',
            },
          ],
        })
        .execPopulate();
      const { posts } = project;
      // console.log(Object.values(posts));

      // no cursor provided, just fetch the latest few posts
      // else try and find its index
      let cursorIndex = posts.length;
      if (cursor !== undefined) {
        cursorIndex = posts.findIndex(
          (post) => post.id.toString() === cursor.toString()
        );

        if (cursorIndex === -1) {
          errors.cursorNotFound =
            "Cursor doesn't exist, please check the cursor ID";
          throw new UserInputError('Cursor not found', { errors });
        }
      }

      // sorted by creation time oldest -> newest
      const res = [];

      // NOTE:
      // starting from 1 to avoid sending the cursor object
      // don't forget to include the 0 item
      for (let i = 1; i <= skip; i += 1) {
        if (cursorIndex - i >= 0) {
          res.unshift(posts[cursorIndex - i]);
        }
      }

      const returnObj = {
        posts: res,
        hasMoreItems: cursorIndex - skip > 0,
        nextCursor: res[0].id || null,
      };

      // console.log({ returnObj });
      // console.log(`cursor: ${res[0].body || null}`);
      // returnObj.posts.forEach((e) => console.log(e.body));

      return returnObj;
    } catch (error) {
      throw new Error(error);
    }
  },
  getProjectPosts: async (_, { projectID }, { req }) => {
    const user = authenticateHTTP(req);
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
