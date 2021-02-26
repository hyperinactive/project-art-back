require('dotenv').config();
// init the apollo server and graphql
const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');

const mongoose = require('mongoose');
const { DB_URI } = require('./config');

// set up type definitions
const typeDefs = gql`
  type Query {
    hello: String
  }
`;

// resolve queries, mutations and subscriptions
const resolvers = {
  Query: {
    hello: () => 'Hello world!',
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

const app = express();
const port = 4000;
server.applyMiddleware({ app });

mongoose
  .connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('DB Connected');
    return app.listen({ port });
  })
  .then((res) => {
    console.log(`We live now boys at ${res.url} at ${port}`);
  });
