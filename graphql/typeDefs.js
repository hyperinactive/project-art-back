const { gql } = require('apollo-server-express');

// set up type definitions
// [Post] a graphql type, we have to declare it

// input is a type used for configuring inputs
// it is passed to a type like register(RegisterInput)
const typeDefs = gql`
  type Post {
    id: ID!,
    body: String!,
    createdAt: String!,
    username: String!
  }
  type User {
    id: ID!,
    email: String!,
    token: String!,
    username: String!,
    createdAt: String!
  }
  input RegisterInput {
    username: String!,
    password: String!,
    confirmPassword: String!,
    email: String!
  }
  type Query {
    hello: String,
    getPosts: [Post]
    getPost(postID: ID!): Post!  # takes in an argument of post id
  }
  # these will be our mutations
  # register is looking for input of type RegisterInput and will return the type of User
  type Mutation {
    register(registerInput: RegisterInput): User!
    login(username: String!, password: String!): User!  # since we only need 2 things, no types were created, but it CAN be done!
    createPost(body: String!): Post!  # takes in data required to make a post
    deletePost(postID: ID!): String!  # takes id returns a confirmation message
  }
`;

module.exports = typeDefs;
