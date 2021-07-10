const { Schema, model } = require('mongoose');

const messageSchema = new Schema({
  content: String,
  createdAt: String,
  fromUser: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  toUser: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
});

module.exports = model('Message', messageSchema);
