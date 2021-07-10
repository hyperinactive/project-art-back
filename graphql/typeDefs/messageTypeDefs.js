const { gql } = require('apollo-server-express');

const message = gql`
  type Message {
    id: ID!
    createdAt: String!
    content: String!
    fromUser: User!
    toUser: User!
  }

  # necessary evil, can't think of better way
  type UserMessagesResponse {
    user: User!
    messages: [Message!]
    latestMessage: Message
  }

  type MessageFeed {
    messages: [Message!]
    hasMoreItems: Boolean!
    nextCursor: String
  }

  extend type Query {
    getMessages(toUserID: ID!): [Message!]
    getUserMessages: [UserMessagesResponse!]
    getUserMessagesFeed(userID: ID!, cursorTimestamp: String): MessageFeed!
  }
  extend type Mutation {
    sendMessage(toUserID: ID!, content: String!): Message!
  }
  extend type Subscription {
    newMessage: Message!
  }
`;

module.exports = message;
