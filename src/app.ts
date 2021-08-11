import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import { NotFoundError, errorHandler, currentUser } from '@hireaboat/common';

import cookieSession from 'cookie-session';
import { createBoatRouter } from './routes/new';
import { showBoatRouter } from './routes/show';
import { updateBoatRouter } from './routes/update';
import { showBoatsRouter } from './routes';
import { deleteBoatRouter } from './routes/delete';

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test',
  })
);

app.use(currentUser);

app.use(showBoatsRouter);
app.use(createBoatRouter);
app.use(showBoatRouter);
app.use(updateBoatRouter);
app.use(deleteBoatRouter);

app.all('*', async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
