const {
  UserInputError,
  AuthenticationError,
} = require('apollo-server-express');

const ProjectGroup = require('../../models/ProjectGroup');
const checkAuth = require('../../utils/checkAuth');

const projectGroupResolver = {
  Query: {
    getProjectGroups: async () => {
      try {
        const groups = await ProjectGroup.find({})
          .populate('owner')
          .populate('members');
        return groups;
      } catch (error) {
        throw new Error(error);
      }
    },
    getProjectGroup: async (_, { projectGroupID }) => {
      try {
        const project = await ProjectGroup.findById(projectGroupID);

        if (!project) throw new Error("Project doesn't exist");
        return await project
          .populate('owner')
          .populate('members')
          .execPopulate();
      } catch (error) {
        throw new Error(error);
      }
    },
  },
  Mutation: {
    createProjectGroup: async (_, { name }, context) => {
      const user = checkAuth(context);
      const errors = {};

      try {
        const group = new ProjectGroup({
          name,
          description: `create new --project ${name}`,
          owner: user.id,
          members: user.id,
          createdAt: new Date().toISOString(),
        });

        const nameCheck = await ProjectGroup.find({ name });
        if (nameCheck.length !== 0) {
          errors.nameInUse = 'Name already in use';
          throw new UserInputError('Name already in use', { errors });
        }
        await group.save();
        return await group.populate('owner').populate('members').execPopulate();
      } catch (error) {
        throw new Error(error);
      }
    },
    // for simplicity update functions will be split
    // TODO: have multiple ways of updating groups
    // maybe check for each update and call different update functions
    // or just have many different update funcs idk
    updateProjectGroup: async (
      _,
      { name, description, projectGroupID },
      context
    ) => {
      const user = checkAuth(context);

      try {
        // validate input
        if (name === '' || description === '')
          throw new UserInputError('Missing input');

        const group = await (
          await await ProjectGroup.findById(projectGroupID).populate('owner')
        ).execPopulate();

        // look for existing groups
        if (!group) throw new UserInputError("Project group doesn't exist");
        if (group.owner.id !== user.id)
          throw new AuthenticationError('Action not allowed');

        const checkName = await ProjectGroup.findOne({ name });
        if (checkName && checkName.name !== group.name)
          throw new UserInputError('Name already in use');

        // const update = { name, description };
        // await group.updateOne(update);
        group.name = name;
        group.description = description;
        await group.save();
        const res = await group.populate('members').execPopulate();
        return res;
      } catch (error) {
        throw new Error(error);
      }
    },
  },
};

module.exports = projectGroupResolver;
