const { Schema, model } = require('mongoose');

// weak entity, attach to each user
// auxiliary model to help query requests, invitations, mentions, unread messages etc...
const notificationSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  request: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Request',
    },
  ],
  unreadMessages: [
    {
      type: Schema.Types.ObjectId,
      ref: 'UnreadMessages',
    },
  ],
});

module.exports = model('Notification', notificationSchema);
