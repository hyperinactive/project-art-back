const { gql } = require('apollo-server-express');

const comment = gql`
  type Comment {
    id: ID!
    createdAt: String!
    username: String!
    body: String!
  }

  extend type Mutation {
    createComment(postID: ID!, body: String!): Comment!
    deleteComment(postID: ID!, commentID: ID!): Comment!
  }
`;

module.exports = comment;
