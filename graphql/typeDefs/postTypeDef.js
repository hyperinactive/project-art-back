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
    project: Project!
    imageURL: String
    # additional props
    # need to be counted
    # to reduce the computation we're gonna use a "modifier"
    commentCount: Int!
    likeCount: Int!
  }
  type PostsCursorResponse {
    posts: [Post!]
    nextCursor: ID
    hasMoreItems: Boolean!
  }
  type PostFeed {
    posts: [Post!]
    nextCursor: String
    hasMoreItems: Boolean!
  }
  type File {
    url: String!
  }
  type Like {
    id: ID!
    createdAt: String!
    username: String!
  }

  extend type Query {
    getPosts: [Post!]
    getPost(postID: ID!): Post! # takes in an argument of post id
    getProjectPosts(projectID: ID!): [Post!]
    getPostsFeed(projectID: ID!, cursor: ID, skip: Int): PostsCursorResponse!
    getFeed(projectID: ID!, cursor: String): PostFeed!
  }
  extend type Mutation {
    deletePost(postID: ID!): Post! # takes id returns a confirmation message
    likeTogglePost(postID: ID!): Post! # will work as a toggle, no need for an "unlike" mutation
    createProjectPost(projectID: ID!, body: String!, image: Upload): Post!
    editPost(postID: ID!, body: String!): Post!
  }
  extend type Subscription {
    newPost: Post!
  }
`;

module.exports = post;
