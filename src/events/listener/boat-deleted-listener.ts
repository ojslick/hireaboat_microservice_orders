import { Message } from 'node-nats-streaming';
import { Subjects, Listener, BoatDeletedEvent } from '@hireaboat/common';
import { Boat } from '../../models/boat';
import { queueGroupName } from './queue-group-name';

export class BoatDeletedListener extends Listener<BoatDeletedEvent> {
  subject: Subjects.BoatDeleted = Subjects.BoatDeleted;
  queueGroupName = queueGroupName;

  async onMessage(data: BoatDeletedEvent['data'], msg: Message) {
    const boat = await Boat.findById(data.id);

    if (!boat) {
      throw new Error('Boat not found');
    }

    await boat?.deleteOne();

    msg.ack();
  }
}
