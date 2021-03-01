const { gql } = require('apollo-server-express');

// set up type definitions
// [Post] a graphql type, we have to declare it

// input is a type used for configuring inputs
// it is passed to a type like register(RegisterInput)
const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    token: String!
    username: String!
    createdAt: String!
  }
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
  type ProjectGroup {
    id: ID!
    name: String!
    description: String!
    passwordLocked: Boolean!
    password: String!
    createdAt: String!
    owner: User!
    moderators: [User!]
    members: [User!]
  }
  type Comment {
    id: ID!
    createdAt: String!
    username: String!
    body: String!
  }
  type Like {
    id: ID!
    createdAt: String!
    username: String!
  }
  input RegisterInput {
    username: String!
    password: String!
    confirmPassword: String!
    email: String!
  }
  input UpdateUserInput {
    userID: ID!
    username: String!
    # placeholders: to be changed via mail or smth
    email: String!
    password: String!
    confirmPassword: String!
  }
  type Query {
    hello: String
    getPosts: [Post!]
    getPost(postID: ID!): Post! # takes in an argument of post id
    getUsers: [User!]
  }
  # these will be our mutations
  # register is looking for input of type RegisterInput and will return the type of User
  type Mutation {
    register(registerInput: RegisterInput): User!
    login(username: String!, password: String!): User! # since we only need 2 things, no types were created, but it CAN be done!
    updateUser(updateUserInput: UpdateUserInput): User!

    createPost(body: String!): Post! # takes in data required to make a post
    deletePost(postID: ID!): String! # takes id returns a confirmation message
    createComment(postID: String!, body: String!): Comment!
    deleteComment(postID: String!, commentID: ID!): Comment!
    likeTogglePost(postID: ID!): Post! # will work as a toggle, no need for an "unlike" mutation

    # createProjectGroup(): ProjectGroup!
  }
  # commonly used for polls and chat-apps
  # type Subscription {
  #   newPost: Post!
  # }
`;

module.exports = typeDefs;
