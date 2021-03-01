const { UserInputError } = require('apollo-server-express');

const ProjectGroup = require('../../models/ProjectGroup');
const checkAuth = require('../../utils/checkAuth');

const projectGroupResolver = {
  Query: {
    getProjectGroups: async () => {
      try {
        const groups = await ProjectGroup.find({}).populate('owner');
        return groups;
      } catch (error) {
        throw new Error(error);
      }
    },
    getProjectGroup: async (_, { projectGroupID }) => {
      try {
        const group = await ProjectGroup.findById(projectGroupID);

        if (!group) throw new Error('Post not found');
        return group;
      } catch (error) {
        throw new Error(error);
      }
    },
  },
  Mutation: {
    createProjectGroup: async (_, { name }, context) => {
      const user = checkAuth(context);

      try {
        const group = new ProjectGroup({
          name,
          description: `create new --project ${name}`,
          owner: user.id,
        });

        const nameCheck = await ProjectGroup.find({ name });
        if (nameCheck.length !== 0)
          throw new UserInputError('Name already in use');

        await group.save();
        return group.populate('owner').execPopulate();
      } catch (error) {
        throw new Error(error);
      }
    },
  },
};

module.exports = projectGroupResolver;
