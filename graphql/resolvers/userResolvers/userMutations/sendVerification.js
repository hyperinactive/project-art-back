const sgMail = require('@sendgrid/mail');
const { UserInputError } = require('apollo-server-express');

const KeyCode = require('../../../../models/KeyCode');
const User = require('../../../../models/User');

const authenticateHTTP = require('../../../../utils/authenticateHTTP');
const generateTemplate = require('../../../../utils/emailTemplate');
const { generateRandomCode } = require('../../../../utils/generate');

const sendVerification = async (_, __, { req }) => {
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
};

module.exports = sendVerification;
