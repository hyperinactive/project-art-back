const { gql } = require('apollo-server-express');

const projectGroup = gql`
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

  extend type Mutation {
    createProjectGroup: ProjectGroup!
  }
`;

module.exports = projectGroup;
