const { gql } = require('apollo-server-express');

const comment = gql`
  type Comment {
    id: ID!
    createdAt: String!
    username: String!
    body: String!
    user: User!
    post: Post!
  }

  extend type Query {
    getComments(postID: ID!): [Comment!]
  }

  extend type Mutation {
    createComment(postID: ID!, body: String!): Comment!
    deleteComment(postID: ID!, commentID: ID!): Comment!
  }
`;

module.exports = comment;
