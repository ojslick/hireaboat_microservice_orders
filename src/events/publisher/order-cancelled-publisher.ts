import { Subjects, Publisher, OrderCancelledEvent } from '@hireaboat/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  Subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
