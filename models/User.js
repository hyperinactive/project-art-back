const { model, Schema } = require('mongoose');

// since we're using graphql
// and we've got restrictions there
// there is no need to implement them here
const userSchema = new Schema({
  username: String,
  password: String,
  email: String,
  createdAt: {
    type: String,
    default: Date.now().toString(),
  },
});

module.exports = model('User', userSchema);
