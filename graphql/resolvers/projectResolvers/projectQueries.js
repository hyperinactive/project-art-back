const { UserInputError, ApolloError } = require('apollo-server-express');

const Project = require('../../../models/Project');
const User = require('../../../models/User');
const authenticateHTTP = require('../../../utils/authenticateHTTP');

const Query = {
  getProjects: async () => {
    try {
      const groups = await Project.find({})
        .populate('owner')
        .populate('members');
      return groups;
    } catch (error) {
      throw new ApolloError('InternalError', { error });
    }
  },
  // to be call when an overview of the project is needed
  // NOTE: populate only when necessary
  // TODO: multiple requests to fetch just the right amount of data
  getProject: async (_, { projectID }) => {
    try {
      const project = await Project.findById(projectID);

      if (!project) throw new Error("Project doesn't exist");
      return await project
        .populate('owner')
        .populate('posts')
        .populate('members', 'id')
        .execPopulate();
    } catch (error) {
      throw new ApolloError('InternalError', { error });
    }
  },
  getProjectMembers: async (_, { projectID }, { req }) => {
    authenticateHTTP(req);
    try {
      // const user = checkAuth(context);
      const project = await Project.findById(projectID);

      if (!project) throw new UserInputError("Project doesn't exist");

      // check the membership
      await project.populate('members').execPopulate();
      // if (
      //   project.members.find((member) => member.id === user.id) === undefined
      // ) {
      //   throw new AuthenticationError('Member-only action');
      // }

      return project.members;
    } catch (error) {
      throw new ApolloError('InternalError', { error });
    }
  },
  getUserProjects: async (_, { userID }, { req }) => {
    const user = authenticateHTTP(req);
    const searchID = userID === undefined ? user.id : userID;
    try {
      const fUser = await User.findById(searchID);

      await fUser.populate('owner').populate('projects').execPopulate();
      return fUser.projects;
    } catch (error) {
      throw new ApolloError('InternalError', { error });
    }
  },
};

module.exports = Query;
