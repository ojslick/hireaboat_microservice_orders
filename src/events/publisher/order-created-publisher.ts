import { Publisher, OrderCreatedEvent, Subjects } from '@hireaboat/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  Subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
