const { gql } = require('apollo-server-express');

const message = gql`
  type Message {
    id: ID!
    createdAt: String!
    content: String!
    fromUser: User!
    toUser: User!
  }
  extend type Query {
    getMessages(toUserID: String!): [Message]!
  }
  extend type Mutation {
    sendMessage(toUserID: String!, content: String!): Message!
  }
`;

module.exports = message;
