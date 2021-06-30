const { gql } = require('apollo-server-express');

// https://medium.com/@choudlet/how-to-combine-graphql-type-definitions-quickly-and-easily-with-apollo-server-c96c4d9a7ea1
// This root Mutation and Query only serve one purpose — to be extended on by the Queries and Mutations in my other files.
const root = gql`
  type Query {
    root: String!
  }

  type Mutation {
    root: String!
  }

  type Subscription {
    root: String!
  }
`;

module.exports = root;
