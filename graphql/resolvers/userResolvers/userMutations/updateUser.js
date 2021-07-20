/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
const uuid = require('uuid');
const stream = require('stream');
const { UserInputError, ApolloError } = require('apollo-server-express');

const User = require('../../../../models/User');
const authenticateHTTP = require('../../../../utils/authenticateHTTP');
const { checkForExistingUsername } = require('../../../../utils/validators');
const { deleteFile, uploadBase64 } = require('../../../../utils/storage');
const { generateToken } = require('../../../../utils/generate');

/**
 * updates user info
 *
 * @param {*} _ apollo parent resolver
 * @param {username: string, status: string, skills: string, image: string} { username, status, skills, image }
 * @param {express.Request} { req } request object from the context
 * @return {Object} user and token
 */
const updateUser = async (_, { username, status, skills, image }, { req }) => {
  const user = authenticateHTTP(req);
  const fUser = await User.findById(user.id);
  const errors = {};

  if (!fUser) {
    throw new UserInputError('No user found');
  }

  // if the username stays the same don't check for an existing username
  if (username !== fUser.username) {
    checkForExistingUsername(username);
  }

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

    const key = `${uuid.v4()}.png}`;
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
};

module.exports = updateUser;
