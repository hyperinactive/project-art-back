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
    posts: [Post!]
    memberCount: Int!
  }

  extend type Query {
    getProjectGroups: [ProjectGroup!]
    getProjectGroup(projectGroupID: ID!): ProjectGroup!
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
