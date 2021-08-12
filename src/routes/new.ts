import {
  BadRequestError,
  NotFoundError,
  OrderStatus,
  requireAuth,
  validateRequest,
} from '@hireaboat/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import mongoose from 'mongoose';
import { OrderCreatedPublisher } from '../events/publisher/order-created-publisher';
import { Boat } from '../models/boat';
import { Order } from '../models/order';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post(
  '/api/orders',
  requireAuth,
  [
    body('boatId')
      .notEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input)),
    body('startDate')
      .trim()
      .isDate()
      .withMessage('Start date must be a valid date'),
    body('endDate')
      .trim()
      .isDate()
      .withMessage('End date must be a valid date'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { boatId, startDate, endDate } = req.body;

    const boat = await Boat.findById(boatId);

    const boats = await Boat.find();

    if (!boat) {
      throw new NotFoundError();
    }

    const isReserved = await boat.isReserved();
    if (isReserved) {
      throw new BadRequestError('Boat is already reserved');
    }

    // calculate the bookingAmount
    //TODO: add time of the day for start date and end date
    const calDifferenceInDays = () => {
      const differenceInTime =
        new Date(endDate).getTime() - new Date(startDate).getTime();
      const differenceInDays = differenceInTime / (1000 * 3600 * 24);
      if (new Date(startDate).getTime() > new Date(endDate).getTime()) {
        throw new BadRequestError('Start date cannot be greater than End date');
      } else if (
        new Date(endDate).getTime() - new Date(startDate).getTime() ===
        0
      ) {
        return 1 * boat.price;
      } else {
        return differenceInDays * boat.price;
      }
    };

    //Build the order and save it to the database
    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      startDate,
      endDate,
      bookingAmount: calDifferenceInDays(),
      boat,
    });
    await order.save();

    await new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      status: order.status,
      userId: order.userId,
      startDate: order.startDate.toString(),
      endDate: order.endDate.toString(),
      bookingAmount: order.bookingAmount,
      //@ts-ignore
      boat,
    });

    res.status(201).send(order);
  }
);

export { router as newOrderRouter };
