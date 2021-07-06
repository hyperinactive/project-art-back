const { gql } = require('apollo-server-express');

const project = gql`
  type Project {
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
    getProjects: [Project!]
    getProject(projectID: ID!): Project!
    getProjectMembers(projectID: ID!): [User!]
    getUserProjects(userID: ID): [Project!]
  }
  extend type Mutation {
    createProject(name: String!): Project!
    updateProject(name: String!, description: String!, projectID: ID!): Project!
    addMember(projectID: ID!): User!
  }
`;

module.exports = project;
