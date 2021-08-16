import {
  NotAuthorizedError,
  NotFoundError,
  OrderStatus,
  requireAuth,
} from '@hireaboat/common';
import express, { Request, Response } from 'express';
import { OrderCancelledPublisher } from '../events/publisher/order-cancelled-publisher';
import { Order } from '../models/order';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.delete(
  '/api/orders/:id',
  requireAuth,
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    order.status = OrderStatus.Cancelled;
    await order.save();

    //publish an event saying this order was cancelled
    new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      boat: {
        id: order.boat.id,
      },
    });

    res.status(204).send(order);
  }
);

export { router as deleteOrderRouter };
