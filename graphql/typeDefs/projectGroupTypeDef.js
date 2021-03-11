const { gql } = require('apollo-server-express');

const projectGroup = gql`
  type ProjectGroup {
    id: ID!
    name: String!
    description: String!
    createdAt: String!
    owner: User!
    moderators: [User!]
    members: [User!]
    memberCount: Int!
  }

  extend type Query {
    getProjectGroups: [ProjectGroup!]
    getProjectGroup(groupID: ID!): ProjectGroup!
  }
  extend type Mutation {
    createProjectGroup(name: String!): ProjectGroup!
    updateProjectGroup(
      name: String!
      description: String!
      projectGroupID: ID!
    ): ProjectGroup!
  }
`;

module.exports = projectGroup;
