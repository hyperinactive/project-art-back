const { gql } = require('apollo-server-express');

const user = gql`
  type User {
    id: ID!
    email: String!
    emailVerified: Boolean!
    token: String!
    username: String!
    createdAt: String!
    status: String!
    interests: [String!]
    skills: String!
    friends: [User!]
    projects: [Project!]
    role: String!
    imageURL: String
  }
  type ADD_FRIEND {
    sender: User!
    receiver: User!
  }

  input DevRegisterInput {
    username: String!
    password: String!
    email: String!
    secretKey: String!
  }
  input RegisterInput {
    username: String!
    password: String!
    confirmPassword: String!
    email: String!
  }
  input UpdateUserInput {
    username: String!
    status: String!
    skills: String!
    image: Upload
  }

  extend type Query {
    getUsers: [User!]
    getUser(userID: ID!): User!
    getFriends: [User!]
    getUserFriends(userID: ID!): [User!]
  }
  extend type Mutation {
    devRegister(devRegisterInput: DevRegisterInput): User!
    register(registerInput: RegisterInput): User!
    login(username: String!, password: String!): User!
    updateUser(updateUserInput: UpdateUserInput): User!
    addFriend(username: String, userID: ID): ADD_FRIEND!
    sendVerification: Boolean!

    verifyUser(code: String!): User!
  }
`;

module.exports = user;
