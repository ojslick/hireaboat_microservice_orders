import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { OrderStatus } from '@hireaboat/common';
import { BoatDoc } from './boat';

export { OrderStatus };

// An interface that describes the properties that are required to create a new order
interface OrderAttrs {
  userId: string;
  status: OrderStatus;
  expireAt: Date;
  startDate: Date;
  endDate: Date;
  bookingAmount: number;
  boat: BoatDoc;
}

// An interface that describes the properties that a order document has
interface OrderDoc extends mongoose.Document {
  userId: string;
  status: OrderStatus;
  expireAt: Date;
  startDate: Date;
  endDate: Date;
  bookingAmount: number;
  boat: BoatDoc;
  version: number;
}

// An interface that describes the properties that a order model has.
interface OrderModel extends mongoose.Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc;
}

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Created,
    },
    expireAt: {
      type: mongoose.Schema.Types.Date,
    },
    startDate: {
      type: mongoose.Schema.Types.Date,
      required: true,
    },
    endDate: {
      type: mongoose.Schema.Types.Date,
      require: true,
    },
    bookingAmount: {
      type: Number,
      required: true,
    },
    boat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Boat',
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
    timestamps: true,
  }
);

orderSchema.set('versionKey', 'version');
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.build = (attrs: OrderAttrs) => {
  return new Order(attrs);
};

//@ts-ignore
const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

export { Order };
