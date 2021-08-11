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
import { Boat } from '../models/boat';
import { Order } from '../models/order';

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

    if (!boat) {
      throw new NotFoundError();
    }

    const isReserved = await boat.isReserved();
    if (isReserved) {
      throw new BadRequestError('Boat is already reserved');
    }

    // calculate the bookingAmount
    //TODO: add time of the day for start date and end date
    const differenceInTime =
      new Date(endDate).getTime() - new Date(startDate).getTime();
    const differenceInDays = differenceInTime / (1000 * 3600 * 24);

    //Build the order and save it to the database
    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      startDate,
      endDate,
      bookingAmount: differenceInDays * boat.price,
      boat,
    });
    await order.save();

    res.status(201).send(order);
  }
);

export { router as newOrderRouter };
