/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
const { UserInputError, ApolloError } = require('apollo-server-express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const uuid = require('uuid');
const stream = require('stream');
const sgMail = require('@sendgrid/mail');

const {
  validateRegisterInput,
  validateLoginInput,
} = require('../../../utils/validators');
const User = require('../../../models/User');
const KeyCode = require('../../../models/KeyCode');
const authenticateHTTP = require('../../../utils/authenticateHTTP');
const {
  // uploadFile,
  deleteFile,
  uploadBase64,
} = require('../../../utils/storage');
const generateTemplate = require('../../../utils/emailTemplate');
// const allowedImageTypes = require('../../../utils/types');

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
      emailVerified: user.emailVerified,
      username: user.username,
      role: user.role,
      imageURL: user.imageURL,
    },
    process.env.SECRET,
    {
      expiresIn: '1h',
    }
  );

const generateRandomCode = (min = 1000, max = 10000) =>
  Math.floor(Math.random() * (max - min) + min).toString();

// ------------------------------------------------------------
const Mutation = {
  devRegister: async (
    _,
    { devRegisterInput: { username, email, password, secretKey } }
  ) => {
    if (secretKey !== process.env.DEV_SECRET_KEY)
      throw new ApolloError('Nice try bucko');

    const { valid, errors } = validateRegisterInput(
      username,
      email,
      password,
      password
    );

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
      emailVerified: true,
      username,
      password,
      createdAt: new Date().toISOString(),
      friends: [],
      projects: [],
      imageURL: null,
    });
    const res = await newUser.save();
    const token = generateToken(res);

    return {
      ...res._doc, // where the document is stored, user data, from MongoDB
      id: res._id, // id is not stored in the doc so we extract it like this
      token,
    };
  },
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
      emailVerified: false,
      username,
      password,
      createdAt: new Date().toISOString(),
      friends: [],
      projects: [],
      imageURL: null,
    });

    // result of registering a new user
    const res = await newUser.save();
    // -----------------------------------------------------------------

    const randomCode = generateRandomCode();
    const keyCode = new KeyCode({
      code: randomCode,
      createdAt: new Date().toISOString(),
      expiresIn: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // + 10min
      user: res._id,
    });

    await keyCode.save();

    sgMail.setApiKey(process.env.SG_KEY);
    const mail = {
      to: email,
      from: process.env.SG_SENDER,
      subject: 'ProjectArt - Email verification',
      html: generateTemplate(username, res._id, randomCode),
    };

    sgMail
      .send(mail)
      .then(() => {
        console.log(`Verification sent to ${email}`);
      })
      .catch((error) => {
        console.error(error);
      });
    // const transport = createTransport({
    //   service: 'gmail',
    //   auth: {
    //     user: process.env.EMAIL_USER,
    //     pass: process.env.EMAIL_PASS,
    //   },
    // });

    // const mail = {
    //   from: 'ProjectArt',
    //   to: email,
    //   subject: 'ProjectArt',
    //   html: generateTemplate(username, res._id),
    //   // text: 'will you really reject this google?',
    // };

    // // eslint-disable-next-line no-unused-vars
    // transport.sendMail(mail, (error) => {
    //   if (error) {
    //     console.log(error);
    //   }
    // });

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
  updateUser: async (
    _,
    { updateUserInput: { username, status, skills, image } },
    { req }
  ) => {
    const user = authenticateHTTP(req);
    const fUser = await User.findById(user.id);
    const errors = {};

    if (!fUser) {
      throw new UserInputError('No user found');
    }

    // if the username stays the same don't check for an existing username
    if (username !== fUser.username) {
      checkForExistingUsernme(username);
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

    // const update = { username, skills, status, imageURL: url };
    // await fUser.updateOne(update);

    let url = fUser.imageURL;
    if (image) {
      const cleanBuffer = image.replace('data:image/png;base64,', '');
      // const imgBuffer = Buffer.from(base64, 'base64');
      const imgBuffer = Buffer.from(cleanBuffer, 'base64');
      const imageStream = new stream.Readable();
      imageStream.push(imgBuffer);
      imageStream.push(null);

      // if the user already have an avatar, delete it form the storage
      if (fUser.imageURL) {
        await deleteFile(fUser.imageURL);
      }

      // const { createReadStream, mimetype } = await image;

      // if (!Object.values(allowedImageTypes).find((type) => type === mimetype)) {
      //   errors.allowedType = 'File type not allowed';
      //   throw new UserInputError('File type not allowed', { errors });
      // }

      const key = `${uuid.v4()}.png`;
      try {
        await uploadBase64(imageStream, key)
          .then((data) => console.log(data))
          .catch((err) => console.log(err));
        // url = `http://localhost:4000/${key}`;
        url = `${key}`;
      } catch (error) {
        throw new ApolloError('Error uploading the file', error);
      }
    }

    fUser.username = username.trim();
    fUser.skills = skills.trim();
    fUser.status = status.trim();
    fUser.imageURL = url;

    await fUser.save();

    const token = generateToken(fUser);

    return {
      ...fUser._doc, // where the document is stored, user data, from MongoDB
      id: fUser._id, // id is not stored in the doc so we extract it like this
      token,
    };
  },
  // TODO: obviously we need to accept or decline these, placeholder code, LUL
  addFriend: async (_, { userID, username }, { req }) => {
    const user = authenticateHTTP(req);

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

      return {
        sender,
        receiver,
      };
    } catch (error) {
      console.log(error);
      throw new ApolloError('InternalError', { error });
    }
  },
  sendVerification: async (_, __, { req }) => {
    const user = authenticateHTTP(req);

    const fUser = await User.findById(user.id);

    if (!fUser) throw new UserInputError('Nonexistent user');
    if (fUser.emailVerified) throw new UserInputError('Already verified');

    const randomCode = generateRandomCode();
    const keyCode = new KeyCode({
      code: randomCode,
      createdAt: new Date().toISOString(),
      expiresIn: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // + 10min
      user: fUser.id,
    });

    try {
      await keyCode.save();

      sgMail.setApiKey(process.env.SG_KEY);
      const mail = {
        to: fUser.email,
        from: process.env.SG_SENDER,
        subject: 'ProjectArt - Email verification',
        html: generateTemplate(fUser.username, randomCode),
      };

      sgMail
        .send(mail)
        .then(() => {
          console.log(`Verification sent to ${fUser.email}`);
        })
        .catch((error) => {
          console.error(error);
        });
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  },
  verifyUser: async (_, { code }, { req }) => {
    const user = authenticateHTTP(req);
    const errors = {};

    const fUser = await User.findById(user.id);

    // TODO: holy shit, too much repetition
    // create custom errros/verification?
    if (!fUser) throw new UserInputError('Nonexistent user');
    if (fUser.emailVerified) throw new UserInputError('Already verified');

    const keycode = await KeyCode.find({ user: user.id });
    console.log(keycode);
    if (keycode.length === 0) throw new UserInputError('Nonexistent keycode');

    if (keycode[0].expiresIn < new Date().toISOString()) {
      errors.codeExpired = 'Your code has expired';
    }

    if (Object.keys(errors).length > 0)
      throw new ApolloError('Internal error', { errors });

    if (code === keycode[0].code) {
      fUser.emailVerified = true;
    }

    await fUser.save();
    // await KeyCode.deleteMany({ user: user.id }); // in case the user racked up codes but used none
    const token = generateToken(fUser);

    return {
      ...fUser._doc,
      id: fUser._id,
      token,
    };
  },
};

module.exports = Mutation;
