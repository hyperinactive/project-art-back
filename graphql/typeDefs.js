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
  }
  # these will be our mutations
  # register is looking for input of type RegisterInput and will return the type of User
  type Mutation {
    register(RegisterInput): User!
  }
`;

module.exports = typeDefs;
