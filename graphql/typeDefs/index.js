// entry point to typeDefs module
// here I combine the type definitions into a single array
const root = require('./root');
const user = require('./userTypeDef');
const post = require('./postTypeDef');
const comment = require('./commentTypeDef');
const project = require('./projectTypeDef');
const message = require('./messageTypeDefs');
const request = require('./requestTypeDefs');

const schemaArray = [root, user, post, comment, project, message, request];

module.exports = schemaArray;
