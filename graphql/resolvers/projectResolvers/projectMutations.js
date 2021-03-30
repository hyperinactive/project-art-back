const {
  UserInputError,
  AuthenticationError,
  ApolloError,
} = require('apollo-server-express');

const Project = require('../../../models/Project');
const User = require('../../../models/User');
const checkAuth = require('../../../utils/checkAuth');

const Mutation = {
  createProject: async (_, { name }, context) => {
    const user = checkAuth(context);
    const errors = {};

    try {
      const nameCheck = await Project.find({ name });
      if (nameCheck.length !== 0) {
        errors.nameInUse = 'Name already in use';
        throw new UserInputError('Name already in use', { errors });
      }

      if (name.length > 20) {
        errors.nameLength = 'Name too long';
        throw new UserInputError('Name cannot be longer than 13 characters');
      }

      const group = new Project({
        name,
        description: `create new --project ${name}`,
        owner: user.id,
        members: user.id,
        createdAt: new Date().toISOString(),
      });

      const fUser = await User.findById(user.id);

      fUser.projects.push(group.id);
      await group.save();
      await fUser.save();
      return await group.populate('owner').populate('members').execPopulate();
    } catch {
      throw new ApolloError('Uh oh', 'BAD_USER_INPUT', { errors });
    }
  },
  addMember: async (_, { projectID }, context) => {
    const user = checkAuth(context);
    const errors = {};

    try {
      const project = await Project.findById(projectID);
      if (!project) throw new Error("Project doesn't exist");

      const fMember = project.members.find(
        (member) => member.id.toString() === user.id.toString()
      );
      if (fMember !== undefined) {
        errors.alreadyAMember = 'Already a member';
        throw new UserInputError('Already a member', { errors });
      } else {
        project.members.push(user.id);
        await project.save();

        const fUser = await User.findById(user.id);

        return fUser;
      }
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
    const errors = {};

    try {
      // validate input
      if (name === '' || description === '')
        throw new UserInputError('Missing input');

      // TODO: same code used in project creation, abstract!
      if (name.length > 13) {
        errors.nameLength = 'Name too long';
        throw new UserInputError('Name cannot be longer than 13 characters');
      }

      if (description.length > 30) {
        errors.descriptionLength = 'Description too long';
        throw new UserInputError(
          'Description cannot be longer than 30 characters'
        );
      }

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
};

module.exports = Mutation;
