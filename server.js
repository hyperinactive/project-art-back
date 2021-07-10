require('dotenv').config();
const http = require('http');
const { ApolloServer, PubSub } = require('apollo-server-express');
const mongoose = require('mongoose');

const app = require('./app');
const resolvers = require('./graphql/resolvers');
const typeDefs = require('./graphql/typeDefs');

// ------------------------------------------------------
// setting up subscription, to be fed to the context
// usually set to a field called subscription
// here we're just doing it quick and dirty
// const pubSub = new PubSub();
// ------------------------------------------------------

<<<<<<< HEAD
// feed the server with typeDefs and resolvers
// authentication can be done via express middlewares
// donwside of that approach is that it will run on all request
// so we're gonna use the apollo context
const server = new ApolloServer({
  typeDefs,
  resolvers,
  // context: ({ req }) => ({ req, pubSub }), // we're destructuring the req and passing it into the context
  context: ({ req }) => ({ req }),
  // subscriptions: {
  //   path: '/subscriptions',
  // },
});

const port = process.env.PORT || 4000;
server.applyMiddleware({ app });

// upon connecting to the db start the server
mongoose
  .connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => {
    console.log('DB Connected');
    return app.listen(port);
  })
  .then(() => {
    console.log(`We live now boys at ${port}`);
  })
  .catch((error) => {
    console.log(error);
=======
const startApolloServer = async () => {
  const pubsub = new PubSub();
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req, connection }) => ({ req, pubsub, connection }),
>>>>>>> master
  });

  const httpServer = http.createServer(app);

  const PORT = 4000;
  await server.start();
  server.applyMiddleware({ app });
  server.installSubscriptionHandlers(httpServer);

  // await new Promise((resolve, reject) => httpServer.listen({ port }, resolve));

  try {
    httpServer.listen(PORT);
    console.log(`server ==> Look alive boys`);
  } catch (error) {
    console.log('Apollo server error');
    console.log(error);
    throw new Error(error);
  }

  try {
    await mongoose.connect(process.env.DB_URI_DEV, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log('server ===> DB Connected');
  } catch (error) {
    console.log('DB error');
    console.log(error);
    throw new Error(error);
  }

  return { server, app };
};

startApolloServer();
