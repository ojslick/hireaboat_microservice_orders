import { Message } from 'node-nats-streaming';
import { Subjects, Listener, BoatUpdatedEvent } from '@hireaboat/common';
import { Boat } from '../../models/boat';
import { queueGroupName } from './queue-group-name';

export class BoatUpdatedListener extends Listener<BoatUpdatedEvent> {
  subject: Subjects.BoatUpdated = Subjects.BoatUpdated;
  queueGroupName = queueGroupName;

  async onMessage(data: BoatUpdatedEvent['data'], msg: Message) {
    //@ts-ignore
    const boat = await Boat.findByEvent(data);

    if (!boat) {
      throw new Error('Boat not found');
    }

    const {
      bathrooms,
      boatCapicity,
      boatDescription,
      boatHarbour,
      boatManufacturer,
      boatModel,
      boatType,
      cabins,
      captain,
      city,
      lengthOfBoat,
      photos,
      price,
    } = data;

    boat.set({
      bathrooms,
      boatCapicity,
      boatDescription,
      boatHarbour,
      boatManufacturer,
      boatModel,
      boatType,
      cabins,
      captain,
      city,
      lengthOfBoat,
      photos,
      price,
    });

    await boat.save();

    msg.ack();
  }
}
