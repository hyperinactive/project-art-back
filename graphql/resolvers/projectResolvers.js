const {
  UserInputError,
  AuthenticationError,
} = require('apollo-server-express');

const Project = require('../../models/Project');
const checkAuth = require('../../utils/checkAuth');

const projectResolver = {
  Query: {
    getProjects: async () => {
      try {
        const groups = await Project.find({})
          .populate('owner')
          .populate('members');
        return groups;
      } catch (error) {
        throw new Error(error);
      }
    },
    getProject: async (_, { projectID }) => {
      try {
        const project = await Project.findById(projectID);

        if (!project) throw new Error("Project doesn't exist");
        return await project
          .populate('owner')
          .populate('members')
          .populate('posts')
          .execPopulate();
      } catch (error) {
        throw new Error(error);
      }
    },
  },
  Mutation: {
    createProject: async (_, { name }, context) => {
      const user = checkAuth(context);
      const errors = {};

      try {
        const group = new Project({
          name,
          description: `create new --project ${name}`,
          owner: user.id,
          members: user.id,
          createdAt: new Date().toISOString(),
        });

        const nameCheck = await Project.find({ name });
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
    addMember: async (_, { projectID }, context) => {
      const user = checkAuth(context);
      const errors = {};

      try {
        const project = await Project.findById(projectID).populate('members');
        if (!project) throw new Error("Project doesn't exist");

        if (
          project.members.find((member) => member.id === user.id) === undefined
        ) {
          project.members.push(user.id);
        } else {
          errors.alreadyAMember = 'Already a member';
          throw new UserInputError('Already a member', { errors });
        }
        await project.save();
        return await project
          .populate('members')
          .populate('owner')
          .execPopulate();
      } catch (error) {
        throw new Error(error);
      }
    },
    // for simplicity update functions will be split
    // TODO: have multiple ways of updating groups
    // maybe check for each update and call different update functions
    // or just have many different update funcs idk
    updateProject: async (_, { name, description, projectID }, context) => {
      const user = checkAuth(context);

      try {
        // validate input
        if (name === '' || description === '')
          throw new UserInputError('Missing input');

        const project = await (
          await await Project.findById(projectID).populate('owner')
        ).execPopulate();

        // look for existing groups
        if (!project) throw new UserInputError("Project group doesn't exist");
        if (project.owner.id !== user.id)
          throw new AuthenticationError('Action not allowed');

        const checkName = await Project.findOne({ name });
        if (checkName && checkName.name !== project.name)
          throw new UserInputError('Name already in use');

        // const update = { name, description };
        // await group.updateOne(update);
        project.name = name;
        project.description = description;
        await project.save();
        const res = await project.populate('members').execPopulate();
        return res;
      } catch (error) {
        throw new Error(error);
      }
    },
  },
};

module.exports = projectResolver;
