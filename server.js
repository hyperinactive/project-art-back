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

const startApolloServer = async () => {
  const pubsub = new PubSub();
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req, connection }) => ({ req, pubsub, connection }),
  });

  const httpServer = http.createServer(app);

  const PORT = 4000;
  await server.start();
  server.applyMiddleware({ app });
  server.installSubscriptionHandlers(httpServer);

  // await new Promise((resolve, reject) => httpServer.listen({ port }, resolve));

  try {
    httpServer.listen(process.env.PORT || PORT);
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
