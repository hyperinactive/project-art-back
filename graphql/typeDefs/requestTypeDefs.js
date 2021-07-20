const { gql } = require('apollo-server-express');

const request = gql`
  type Request {
    id: ID!
    createdAt: String!
    fromUser: User!
    toUser: User!
    type: String!
    project: Project
  }

  type CheckRequest {
    request: Request
    isSent: Boolean!
  }

  extend type Query {
    checkFriendRequests(userID: ID!): CheckRequest!
    getUserRequests: [Request!]
  }

  extend type Mutation {
    deleteRequest(requestID: ID!): Request!
  }
`;

module.exports = request;
