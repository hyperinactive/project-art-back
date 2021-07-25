const {
  UserInputError,
  AuthenticationError,
  ApolloError,
} = require('apollo-server-express');

const Project = require('../../../models/Project');
const User = require('../../../models/User');
const authenticateHTTP = require('../../../utils/authenticateHTTP');

const Mutation = {
  /**
   * creates a project
   *
   * @param {*} _
   * @param {Object} args
   * @param {string} args.name
   * @param {Object} context
   * @param {Express.Request} context.req
   * @return {Project}
   */
  createProject: async (_, { name }, { req }) => {
    const user = authenticateHTTP(req);
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

      /**
       * @type {Project}
       */
      const project = new Project({
        name,
        description: `create new --project ${name}`,
        owner: user.id,
        members: user.id,
        createdAt: new Date().toISOString(),
      });

      const fUser = await User.findById(user.id);

      fUser.projects.push(project.id);
      await project.save();
      await fUser.save();
      return await project.populate('owner').populate('members').execPopulate();
    } catch (error) {
      throw new ApolloError('InternalError', { error });
    }
  },
  /**
   * adds a member to a project
   *
   * @param {*} _
   * @param {Object} args
   * @param {string} args.projectID
   * @param {Object} context
   * @param {Express.Request} context.req
   * @return {}
   */
  addMember: async (_, { projectID }, { req }) => {
    const user = authenticateHTTP(req);
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
        fUser.projects.push(project.id);
        await fUser.save();

        return fUser;
      }
    } catch (error) {
      throw new ApolloError('InternalError', { error });
    }
  },
  // for simplicity update functions will be split
  // TODO: have multiple ways of updating groups
  // maybe check for each update and call different update functions
  // or just have many different update funcs idk
  /**
   * updates project info
   *
   * @param {*} _
   * @param {Object} args
   * @param {string} args.name
   * @param {string} args.description
   * @param {string} args.projectID
   * @param {Object} context
   * @param {Express.Request} context.req
   * @return {Project}
   */
  updateProject: async (_, { name, description, projectID }, { req }) => {
    const user = authenticateHTTP(req);
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
      throw new ApolloError('InternalError', { error });
    }
  },
};

module.exports = Mutation;
