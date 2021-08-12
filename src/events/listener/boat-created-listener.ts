import { Message } from 'node-nats-streaming';
import { Subjects, Listener, BoatCreatedEvent } from '@hireaboat/common';
import { Boat } from '../../models/boat';
import { queueGroupName } from './queue-group-name';

export class BoatCreatedListener extends Listener<BoatCreatedEvent> {
  subject: Subjects.BoatCreated = Subjects.BoatCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: BoatCreatedEvent['data'], msg: Message) {
    const boat = Boat.build({
      ...data,
    });

    await boat.save();

    msg.ack();
  }
}
