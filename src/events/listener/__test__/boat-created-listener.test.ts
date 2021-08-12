import { Message } from 'node-nats-streaming';
import mongoose, { mongo } from 'mongoose';
import { BoatCreatedEvent } from '@hireaboat/common';
import { BoatCreatedListener } from '../boat-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Boat } from '../../../models/boat';

const setup = async () => {
  //create an instance of the listener
  const listener = new BoatCreatedListener(natsWrapper.client);

  //create a fake data event
  const data: BoatCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    boatType: 'gnfghg',
    boatManufacturer: 'hjsdjhsd',
    boatModel: 'sjhdhjsdhj',
    city: 'hahdsjhdh',
    boatHarbour: 'hsjdhsjhui',
    captain: true,
    price: 1000,
    cabins: 546,
    bathrooms: 67,
    lengthOfBoat: 876,
    boatCapicity: 56,
    boatDescription: 'smdhjshd',
    photos: ['shhdhjf'],
    userId: new mongoose.Types.ObjectId().toHexString(),
  };

  //create a fake message object
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it('creates and saves a boat', async () => {
  const { listener, data, msg } = await setup();

  //call on onMessage function with the data object + message object
  await listener.onMessage(data, msg);

  //write assertion to make sure the boat was created
  const boat = await Boat.findById(data.id);

  expect(boat).toBeDefined();
  expect(boat!.boatType).toEqual(data.boatType);
  expect(boat!.boatDescription).toEqual(data.boatDescription);
});
