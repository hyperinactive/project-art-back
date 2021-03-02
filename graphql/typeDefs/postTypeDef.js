const { gql } = require('apollo-server-express');

const post = gql`
  type Post {
    id: ID!
    body: String!
    createdAt: String!
    username: String!
    comments: [Comment]!
    likes: [Like]!
    user: User!
    # additional props
    # need to be counted
    # to reduce the computation we're gonna use a "modifier"
    commentCount: Int!
    likeCount: Int!
  }
  type Like {
    id: ID!
    createdAt: String!
    username: String!
  }

  extend type Query {
    getPosts: [Post!]
    getPost(postID: ID!): Post! # takes in an argument of post id
  }
  extend type Mutation {
    createPost(body: String!): Post! # takes in data required to make a post
    deletePost(postID: ID!): String! # takes id returns a confirmation message
    likeTogglePost(postID: ID!): Post! # will work as a toggle, no need for an "unlike" mutation
  }
`;

module.exports = post;