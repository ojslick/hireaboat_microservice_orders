import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { BoatUpdatedEvent } from '@hireaboat/common';
import { BoatUpdatedListener } from '../boat-updated-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Boat } from '../../../models/boat';

const setup = async () => {
  // Create a listener
  const listener = new BoatUpdatedListener(natsWrapper.client);

  //Create and save a ticket
  const boat = Boat.build({
    id: new mongoose.Types.ObjectId().toHexString(),
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
  });

  await boat.save();

  //Create a fake data object
  const data: BoatUpdatedEvent['data'] = {
    id: boat.id,
    boatType: boat.boatType,
    boatManufacturer: 'Toyota',
    boatModel: 'Camry',
    city: boat.city,
    boatHarbour: boat.boatHarbour,
    captain: boat.captain,
    price: boat.price,
    cabins: boat.cabins,
    bathrooms: boat.bathrooms,
    lengthOfBoat: boat.lengthOfBoat,
    boatCapicity: boat.boatCapicity,
    boatDescription: boat.boatDescription,
    photos: boat.photos,
    userId: 'skdjsk',
    version: boat.version! + 1,
  };

  //Create a fake msg object
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  //return all of this stuff
  return { msg, data, boat, listener };
};

it('finds, update and saves a boat', async () => {
  const { msg, data, boat, listener } = await setup();

  await listener.onMessage(data, msg);

  const updatedBoat = await Boat.findById(boat.id);

  expect(updatedBoat!.boatManufacturer).toEqual(data.boatManufacturer);
  expect(updatedBoat!.boatModel).toEqual(data.boatModel);
  expect(updatedBoat!.version).toEqual(data.version);
});

it('acks the message', async () => {
  const { msg, data, listener } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it('does not call ack if the event has a skipped version', async () => {
  const { msg, data, listener } = await setup();

  data.version = 10;

  try {
    await listener.onMessage(data, msg);
  } catch (err) {}

  expect(msg.ack).not.toHaveBeenCalled();
});
