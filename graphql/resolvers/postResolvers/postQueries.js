const {
  AuthenticationError,
  UserInputError,
  ApolloError,
} = require('apollo-server-express');
const Post = require('../../../models/Post');
const Project = require('../../../models/Project');
const authenticateHTTP = require('../../../utils/authenticateHTTP');

const Query = {
  /**
   * get all posts
   *
   * @return {Array.<Post>}
   */
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
  /**
   * get a post by its id
   *
   * @param {*} _
   * @param {Object} args
   * @param {string} args.postID
   * @param {Object} context
   * @param {Express.Request} context.req
   * @return {Post}
   */
  getPost: async (_, { postID }, { req }) => {
    authenticateHTTP(req);

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

      if (!post) {
        throw new Error('Post not found');
      }

      return post;
    } catch (error) {
      throw new Error(error);
    }
  },
  /**
   * deprecated* feed of posts
   *
   * @param {*} _
   * @param {Object} args
   * @param {string} args.projectID
   * @param {string} args.cursor
   * @param {number} [args.skip = 10]
   * @param {Object} context
   * @param {Express.Request} context.req
   * @return {Array.<Post>}
   */
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
      throw new ApolloError('InternalError', { error });
    }
  },
  /**
   * get next 10 posts after the cursor
   *
   * @param {*} _
   * @param {Object} args
   * @param {string} args.projectID
   * @param {string} args.cursor
   * @param {Object} context
   * @param {Express.Request} context.req
   * @return {Array.<Post>}
   */
  getFeed: async (_, { projectID, cursor }, { req }) => {
    const user = authenticateHTTP(req);
    const limit = 10;
    const errors = {};

    try {
      const project = await Project.findById(projectID);
      if (!project) throw new Error("Project doesn't exist");

      await project.populate('members').execPopulate();
      if (!project.members.find((member) => member.id === user.id)) {
        errors.notAMember = 'Members only action';
        throw new AuthenticationError('Action not allowed', { errors });
      }

      // base case
      // save me the trouble is there are not posts to fetch
      if (project.posts.length === 0) {
        return {
          posts: [],
          hasMoreItems: false,
          nextCursor: null,
        };
      }

      let posts = [];

      // just fetch the latest posts if no cursor
      if (cursor === undefined || cursor == null) {
        posts = await Post.find({
          project: projectID,
        })
          .limit(limit + 1)
          .sort({ createdAt: -1 })
          .populate('user', 'id username imageURL status')
          .exec();
      } else {
        // fetch 11 items, 10 + 1, to verify if there's more to fetch
        posts = await Post.find({
          project: projectID,
          createdAt: { $lt: cursor },
        })
          .limit(limit + 1)
          .sort({ createdAt: -1 })
          .populate('user', 'id username imageURL status')
          .exec();
      }

      const hasMoreItems = posts.length === limit + 1;
      posts.pop();

      let nextCursor = null;
      if (posts.length > 0) {
        nextCursor = posts.slice(-1)[0].createdAt;
      }

      return {
        posts,
        hasMoreItems,
        nextCursor,
      };
    } catch (error) {
      console.log(error);
      throw new ApolloError('InternalError', { error });
    }
  },
  /**
   * get all posts of a project
   *
   * @param {*} _
   * @param {Object} args
   * @param {string} args.projectID
   * @param {Object} context
   * @param {Express.Request} context.req
   * @return {Array.<Post>}
   */
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
      throw new ApolloError('InternalError', { error });
    }
  },
};

module.exports = Query;
