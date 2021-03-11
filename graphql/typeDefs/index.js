// entry point to typeDefs module
// here I combine the type definitions into a single array
const root = require('./root');
const user = require('./userTypeDef');
const post = require('./postTypeDef');
const comment = require('./commentTypeDef');
const project = require('./projectTypeDef');

const shemaArray = [root, user, post, comment, project];

module.exports = shemaArray;
