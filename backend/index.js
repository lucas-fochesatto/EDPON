import express from 'express';
import cors from 'cors';

import config from './config.js';
import routes from './Routes/Routes.js';

const app = express();

app.use(cors());
app.use(express.json());

//routes
app.use('/api', routes);

app.listen(`${process.env.VERCEL_URL || config.port}`, () =>
// app.listen(`${config.port}`, () =>
  console.log(`Server is live @ ${config.hostUrl}`),
);