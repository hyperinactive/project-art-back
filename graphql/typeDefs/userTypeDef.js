const { gql } = require('apollo-server-express');

const user = gql`
  type User {
    id: ID!
    email: String!
    emailVerified: Boolean!
    token: String!
    username: String!
    createdAt: String!
    friends: [User!]
    projectsJoined: [ProjectGroup!]
    projectsCreated: [ProjectGroup!]
    role: String!
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

  extend type Query {
    getUsers: [User!]
  }
  extend type Mutation {
    register(registerInput: RegisterInput): User!
    login(username: String!, password: String!): User! # since we only need 2 things, no types were created, but it CAN be done!
    updateUser(updateUserInput: UpdateUserInput): User!
  }
`;

module.exports = user;
