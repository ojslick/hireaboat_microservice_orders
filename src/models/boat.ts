import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { Order, OrderStatus } from './order';

interface BoatAttrs {
  id: string;
  boatType: string;
  boatManufacturer: string;
  boatModel: string;
  city: string;
  boatHarbour: string;
  captain: boolean;
  price: number;
  cabins: number;
  bathrooms: number;
  lengthOfBoat: number;
  boatCapicity: number;
  boatDescription: string;
  photos: string[];
}

export interface BoatDoc extends mongoose.Document {
  boatType: string;
  boatManufacturer: string;
  boatModel: string;
  city: string;
  boatHarbour: string;
  captain: boolean;
  price: number;
  cabins: number;
  bathrooms: number;
  lengthOfBoat: number;
  boatCapicity: number;
  boatDescription: string;
  photos: string[];
  isReserved(): Promise<boolean>;
}

interface BoatModel extends mongoose.Model<BoatDoc> {
  build(attrs: BoatAttrs): BoatDoc;
  findByEvent(event: { id: string; version: number }): Promise<BoatDoc | null>;
}

const boatSchema = new mongoose.Schema(
  {
    boatType: {
      type: String,
      required: true,
    },
    boatManufacturer: {
      type: String,
      required: true,
    },
    boatModel: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    boatHarbour: {
      type: String,
      required: true,
    },
    captain: {
      type: Boolean,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    cabins: {
      type: Number,
      required: true,
    },
    bathrooms: {
      type: Number,
      required: true,
    },
    lengthOfBoat: {
      type: Number,
      required: true,
    },
    boatCapicity: {
      type: Number,
      required: true,
    },
    boatDescription: {
      type: String,
      required: true,
    },
    photos: {
      type: Array,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

boatSchema.set('versionKey', 'version');
boatSchema.plugin(updateIfCurrentPlugin);

boatSchema.statics.findByEvent = (event: { id: string; version: number }) => {
  return Boat.findOne({
    _id: event.id,
    version: event.version - 1,
  });
};

boatSchema.statics.build = (attrs: BoatAttrs) => {
  return new Boat({
    _id: attrs.id,
    boatType: attrs.boatType,
    boatManufacturer: attrs.boatManufacturer,
    boatModel: attrs.boatModel,
    city: attrs.city,
    boatHarbour: attrs.boatHarbour,
    captain: attrs.captain,
    price: attrs.price,
    cabins: attrs.cabins,
    bathrooms: attrs.bathrooms,
    lengthOfBoat: attrs.lengthOfBoat,
    boatCapicity: attrs.boatCapicity,
    boatDescription: attrs.boatDescription,
    photos: attrs.photos,
  });
};

boatSchema.methods.isReserved = async function () {
  //this === the boat document that we just called 'isReserved' on
  const existingOrder = await Order.findOne({
    //@ts-ignore
    boat: this,
    status: {
      $in: [
        OrderStatus.Created,
        OrderStatus.AwaitingPayment,
        OrderStatus.Complete,
      ],
    },
  });

  return !!existingOrder;
};

//@ts-ignore
const Boat = mongoose.model<BoatDoc, BoatModel>('Boat', boatSchema);

export { Boat };
