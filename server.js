require('dotenv').config();

// init the apollo server and graphql
const express = require('express');
// const { ApolloServer, PubSub } = require('apollo-server-express');
const { ApolloServer } = require('apollo-server-express');

// set up mongo
const mongoose = require('mongoose');

const resolvers = require('./graphql/resolvers');
// const typeDefs = require('./graphql/typeDefsLegacy');
const typeDefs = require('./graphql/typeDefs');

// ------------------------------------------------------
// setting up subscription, to be fed to the context
// usually set to a field called subscription
// here we're just doing it quick and dirty
// const pubSub = new PubSub();
// ------------------------------------------------------

// feed the server with typeDefs and resolvers
// authentication can be done via express middlewares
// donwside of that approach is that it will run on all request
// so we're gonna use the apollo context
const server = new ApolloServer({
  typeDefs,
  resolvers,
  // context: ({ req }) => ({ req, pubSub }), // we're destructuring the req and passing it into the context
  context: ({ req }) => ({ req }), // we're destructuring the req and passing it into the context
});

// init the express app
const app = express();
const port = 4000;
server.applyMiddleware({ app });

// upon connecting to the db start the server
mongoose
  .connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB Connected');
    return app.listen(process.env.PORT || port);
  })
  .then(() => {
    console.log(`We live now boys at ${port}`);
  })
  .catch((error) => {
    console.log(error);
  });
