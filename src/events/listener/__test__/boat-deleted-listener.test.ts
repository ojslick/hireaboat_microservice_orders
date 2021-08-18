import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { BoatDeletedEvent } from '@hireaboat/common';
import { BoatDeletedListener } from '../boat-deleted-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Boat } from '../../../models/boat';

const setup = async () => {
  // Create a listener
  const listener = new BoatDeletedListener(natsWrapper.client);

  // Create and save a boat
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

  // Create a fake data object
  const data: BoatDeletedEvent['data'] = {
    id: boat.id,
  };

  // Create a fake msg object
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  //return all this stuff
  return { msg, data, boat, listener };
};

it('it finds and deletes a boat', async () => {
  const { msg, data, boat, listener } = await setup();

  await listener.onMessage(data, msg);

  const delBoat = await Boat.findById(boat.id);

  console.log('delBoat-->', delBoat);
  console.log('boat-->', boat.id);

  expect(delBoat).toEqual(null);
});

it('acks the message', async () => {
  const { msg, data, listener } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

// it('does not call ack if the event has a skipped version number', async () => {
//   const { msg, data, listener } = await setup();

//   data.version = 10;

//   try {
//     await listener.onMessage(data, msg);
//   } catch (err) {}

//   expect(msg.ack).not.toHaveBeenCalled();
// });
