require('dotenv').config();

// init the apollo server and graphql
const express = require('express');
const { ApolloServer } = require('apollo-server-express');

// set up mongo
const mongoose = require('mongoose');

const { DB_URI } = require('./config');
const resolvers = require('./graphql/resolvers/indexResolver');
const typeDefs = require('./graphql/typeDefs');

// feed the server with typeDefs and resolvers
const server = new ApolloServer({ typeDefs, resolvers });

// init the express app
const app = express();
const port = 4000;
server.applyMiddleware({ app });

// upon connecting to the db start the server
mongoose
  .connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('DB Connected');
    return app.listen({ port });
  })
  .then(() => {
    console.log(`We live now boys at ${port}`);
  })
  .catch((error) => {
    console.log(error);
  });
