import * as express from 'express';
import * as morgan from 'morgan';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';
import * as errorhandler from 'errorhandler';
import * as mongoose from 'mongoose';
import * as graphqlHTTP from 'express-graphql-subscriptions';
import { execute, subscribe } from 'graphql';
import { createServer } from 'http';
import { SubscriptionServer } from 'subscriptions-transport-ws';

import env from './env';

import routes from './routes';

import schema from './schema';

import { authenticate } from './service/auth';

import { scheduleCron } from './cron';

const app = express();

// Use node like promise for mongoose
(mongoose as any).Promise = global.Promise;

// Setup MongoDb connection
const dbOptions: any = {
  authSource: 'admin',
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

//connect to mongo db
mongoose.connect(`${env.mongoDbUrl}`, dbOptions);

//cors configuration
app.use(cors({ origin: '*' }));

// Express morgan logs
app.use(morgan('combined'));

// Parse application/x-www-form-urlencoded
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);

// Parse application/json
app.use(bodyParser.json());

//get route for checking the status of api server
app.get('/', (req: express.Request, res: express.Response) => {
  res.json({ success: true, msg: 'Api is running' });
});

//use routes
app.use(routes);

const subscriptionsEndpoint = `ws://localhost:${env.appPort}/subscriptions`;
app.use(
  '/graphql',
  authenticate,
  graphqlHTTP({
    schema,
    graphiql: true,
    subscriptionsEndpoint,
  }),
);

const ws = createServer(app);
ws.listen(env.appPort, () => {
  console.log(
    `${env.appEnv} server is listening at port: ${env.appPort}`,
  );

  // Set up the WebSocket for handling GraphQL subscriptions.
  new SubscriptionServer(
    {
      execute,
      subscribe,
      schema,
    },
    {
      server: ws,
      path: '/subscriptions',
    },
  );
});

//run cron scheduler
scheduleCron();

app.use(errorhandler());
