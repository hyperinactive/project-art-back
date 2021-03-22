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
  type PostsChunkResponse {
    posts: [Post!]
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
    getPostsChunk(skip: Int, limit: Int!): PostsChunkResponse!
    getProjectPosts(projectID: ID!): [Post!]
  }
  extend type Mutation {
    createPost(body: String!): Post! # takes in data required to make a post
    deletePost(postID: ID!): Post! # takes id returns a confirmation message
    likeTogglePost(postID: ID!): Post! # will work as a toggle, no need for an "unlike" mutation
    createProjectPost(projectID: ID!, body: String!, image: Upload): Post!

    # upload testing
    uploadFile(file: Upload!): File!
  }
`;

module.exports = post;
