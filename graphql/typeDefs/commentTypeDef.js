const { gql } = require('apollo-server-express');

const comment = gql`
  type Comment {
    id: ID!
    createdAt: String!
    username: String!
    body: String!
  }

  extend type Mutation {
    createComment(postID: String!, body: String!): Comment!
    deleteComment(postID: String!, commentID: ID!): Comment!
  }
`;

module.exports = comment;
