const { model, Schema } = require('mongoose');

const keyCodeSchema = {
  code: String,
  createdAt: String,
  expires: String,
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
};

module.exports = model('KeyCode', keyCodeSchema);
