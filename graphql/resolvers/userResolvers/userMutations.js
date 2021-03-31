/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
const { UserInputError } = require('apollo-server-express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const uuid = require('uuid');
const {
  validateRegisterInput,
  validateLoginInput,
} = require('../../../utils/validators');

const User = require('../../../models/User');
const checkAuth = require('../../../utils/checkAuth');
const { uploadFile, deleteFile } = require('../../../utils/storage');
const allowedImageTypes = require('../../../utils/types');

// username and email validation
const checkForExistingUsernme = async (username) => {
  const usernameCheck = await User.findOne({ username });
  return usernameCheck !== null;
};

const checkForExistingEmail = async (email) => {
  const emailCheck = await User.findOne({ email });
  return emailCheck !== null;
};

// generate a token
// res contains the user data
const generateToken = (user) =>
  jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    },
    process.env.SECRET,
    {
      expiresIn: '45min',
    }
  );

const Mutation = {
  // args is the input type (eg our registerInput)
  // register(parent, args, context, info) {
  register: async (
    _,
    {
      // we're expecting an input which contains username, email, pass and conf
      registerInput: { username, email, password, confirmPassword },
    } // not using these, but they're here for educational purposes // context, // info,
  ) => {
    // validate
    const { valid, errors } = validateRegisterInput(
      username,
      email,
      password,
      confirmPassword
    );
    // if there were problems take the errors from the errors obj in the validators.js
    // throw an error containing these
    if (!valid) {
      throw new UserInputError('Errors', { errors });
    }

    if (await checkForExistingUsernme(username)) {
      errors.usernameInUse = 'Username already in use';
      throw new UserInputError('Username already in use', { errors });
    }

    if (await checkForExistingEmail(email)) {
      errors.emailInUse = 'Email already in use';
      throw new UserInputError('Email already in use', { errors });
    }

    password = await bcrypt.hash(password, 12);

    const newUser = User({
      email,
      username,
      password,
      createdAt: new Date().toISOString(),
      friends: [],
      projects: [],
      imageURL: null,
    });

    // result of registering a new user
    const res = await newUser.save();

    // make a token
    // perhaps only have id in the payload?
    const token = generateToken(res);

    return {
      ...res._doc, // where the document is stored, user data, from MongoDB
      id: res._id, // id is not stored in the doc so we extract it like this
      token,
    };
  },
  // again, no need to destructure from a type since we only need 2 things
  login: async (_, { username, password }) => {
    // destructure the validateLoginInput
    const { errors, valid } = validateLoginInput(username, password);

    if (!valid) {
      throw new UserInputError('Not valid', { errors });
    }

    // try and find a user that matches the username and pass
    const user = await User.findOne({ username });

    // 404
    // if no user has been found, we'll get a '[]' and not null
    // eslint-disable-next-line eqeqeq
    if (!user) {
      errors.username = 'User not found';
      throw new UserInputError('User not found', { errors });
    }

    const matchEmailPass = await bcrypt.compare(password, user.password);

    if (!matchEmailPass) {
      errors.password = 'Wrong password';
      throw new UserInputError('Wrong password', { errors });
    }

    const token = generateToken(user);

    return {
      ...user._doc, // where the document is stored, user data, from MongoDB
      id: user._id, // id is not stored in the doc so we extract it like this
      token,
    };
  },
  updateUser: async (_, { username, status, skills, image }, context) => {
    const user = checkAuth(context);
    const fUser = await User.findById(user.id);
    const errors = {};

    if (!fUser) {
      throw new UserInputError('No user found');
    }

    // if the username stays the same don't check for an existing username
    if (username !== fUser.username) {
      checkForExistingUsernme(username);
    }

    let url = fUser.imageURL;
    if (image) {
      // if the user already have an avatar, delete it form the storage
      if (fUser.imageURL) {
        await deleteFile(fUser.imageURL);
      }

      const { createReadStream, mimetype } = await image;

      if (!Object.values(allowedImageTypes).find((type) => type === mimetype)) {
        errors.allowedType = 'File type not allowed';
        throw new UserInputError('File type not allowed', { errors });
      }

      const key = `${uuid.v4()}.${mimetype.split('/')[1]}`;
      try {
        await uploadFile(createReadStream, key)
          .then((data) => console.log(data))
          .catch((err) => console.log(err));
        // url = `http://localhost:4000/${key}`;
        url = `${key}`;
      } catch (error) {
        throw new Error('Error uploading the file', error);
      }
    }

    // TODO: need a better way of validating
    if (username.trim() === '') errors.username = 'Username empty';

    if (username.length > 15)
      errors.usernameLength = 'Username cannot be longer than 15 characters';

    if (status.trim() === '') status = 'lurk, lurk';
    if (status.length > 25)
      errors.statusLength = 'Status cannot be longer than 25 characters';

    if (skills.trim() === '') skills = 'very skilled YEP';
    if (skills.length > 30)
      errors.skillsLength = 'Skills cannot be longer than 30 characters';

    if (Object.keys(errors).length > 0)
      throw new UserInputError('InvalidInput', { errors });

    const update = { username, skills, status, imageURL: url };
    await fUser.updateOne(update);

    const token = generateToken(fUser);

    return {
      ...fUser._doc, // where the document is stored, user data, from MongoDB
      id: fUser._id, // id is not stored in the doc so we extract it like this
      token,
    };
  },
  // TODO: obviously we need to accept or decline these, placeholder code, LUL
  addFriend: async (_, { userID, username }, context) => {
    const user = checkAuth(context);

    if (userID === undefined && username === undefined) {
      throw new Error('No data provided');
    }

    try {
      let receiver;
      if (userID !== undefined) {
        receiver = await User.findById(userID);
      } else {
        receiver = await User.findOne({ username });
      }

      const sender = await User.findById(user.id);

      if (!receiver) {
        throw new UserInputError('No user found');
      }

      if (
        receiver.friends.find(
          (friend) => friend.toString() === user.id.toString()
        )
      ) {
        throw new UserInputError('Already friends');
      }

      receiver.friends.push(user.id);
      sender.friends.push(receiver.id);
      await receiver.save();
      await sender.save();

      return receiver;
    } catch (error) {
      throw new Error(error);
    }
  },
};

module.exports = Mutation;
