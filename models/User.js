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
  role: {
    type: String,
    enum: ['member', 'admin', 'developer'],
    default: 'member',
  },
});

module.exports = model('User', userSchema);
