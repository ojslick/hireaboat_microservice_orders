import { app } from './app';
import mongoose from 'mongoose';
import { natsWrapper } from './nats-wrapper';
import { BoatCreatedListener } from './events/listener/boat-created-listener';
import { BoatDeletedListener } from './events/listener/boat-deleted-listener';
import { BoatUpdatedListener } from './events/listener/boat-updated-listener';

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined');
  }

  try {
    await natsWrapper.connect('hireaboat', 'jkdhjs', 'http://nats-srv:4222');
    natsWrapper.client.on('close', () => {
      console.log('NATS connection closed!');
      process.exit();
    });

    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());

    new BoatCreatedListener(natsWrapper.client).listen();
    new BoatDeletedListener(natsWrapper.client).listen();
    new BoatUpdatedListener(natsWrapper.client).listen();

    await mongoose.connect('mongodb://orders-mongo-srv:27017/orders', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log('Connected to mongodb');
  } catch (err) {
    console.error(err);
  }

  app.listen(3000, () => {
    console.log('Listening on port 3000!!!!!!!');
  });
};

start();
