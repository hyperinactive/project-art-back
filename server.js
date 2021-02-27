require('dotenv').config();

// init the apollo server and graphql
const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');

// set up mongo
const mongoose = require('mongoose');

const { DB_URI } = require('./config');
const Post = require('./models/Post');
const User = require('./models/User');

// set up type definitions
// [Post] a graphql type, we have to declare it
const typeDefs = gql`
  type Post {
    id: ID!,
    body: String!,
    createdAt: String!,
    username: String!
  }
  type Query {
    hello: String,
    getPosts: [Post]
  }
`;

// resolve queries, mutations and subscriptions
const resolvers = {
  Query: {
    hello: () => 'Hello world!',
    getPosts: async () => {
      try {
        const posts = await Post.find();
        return posts;
      } catch (error) {
        throw new Error(error);
      }
    },
  },
};

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
  .then((res) => {
    console.log(`We live now boys at ${port}`);
  })
  .catch((error) => {
    console.log(error);
  });
