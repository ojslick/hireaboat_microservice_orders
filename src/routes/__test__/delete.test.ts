import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Boat } from '../../models/boat';
import { OrderStatus } from '@hireaboat/common';
import { natsWrapper } from '../../nats-wrapper';

//returns a 404 if the order is not found
it('returns a 404 if the order is not found', async () => {
  const id = mongoose.Types.ObjectId().toHexString();
  await request(app)
    .delete(`/api/orders/${id}`)
    //@ts-ignore
    .set('Cookie', global.signin())
    .send()
    .expect(404);
});

//returns a 401 if the user is not authorized to delete that order
it('returns a 401 if the user is not authorized to delete that order', async () => {
  const boat = Boat.build({
    id: mongoose.Types.ObjectId().toHexString(),
    boatType: 'jhjhsd',
    boatManufacturer: 'Passat',
    boatModel: 'ML350',
    city: 'Lagos',
    boatHarbour: 'Lekki',
    captain: true,
    price: 1000,
    cabins: 10,
    bathrooms: 2,
    lengthOfBoat: 100,
    boatCapicity: 30,
    boatDescription: 'A very good boat!!!',
    photos: ['skhdhfgywefuh'],
  });

  await boat.save();

  const orderRes = await request(app)
    .post('/api/orders')
    //@ts-ignore
    .set('Cookie', global.signin())
    .send({
      boatId: boat.id,
      startDate: '2021/08/14',
      endDate: '2021/08/16',
    })
    .expect(201);

  await request(app)
    .delete(`/api/orders/${orderRes.body.id}`)
    //@ts-ignore
    .set('Cookie', global.signin())
    .send()
    .expect(401);
});

//expect the cancelled order to have a status of OrderStatus.Cancelled
it('expect the cancelled order to have a status of OrderStatus.Cancelled', async () => {
  //@ts-ignore
  const signin = global.signin();
  const boat = Boat.build({
    id: mongoose.Types.ObjectId().toHexString(),
    boatType: 'jhjhsd',
    boatManufacturer: 'Passat',
    boatModel: 'ML350',
    city: 'Lagos',
    boatHarbour: 'Lekki',
    captain: true,
    price: 1000,
    cabins: 10,
    bathrooms: 2,
    lengthOfBoat: 100,
    boatCapicity: 30,
    boatDescription: 'A very good boat!!!',
    photos: ['skhdhfgywefuh'],
  });

  await boat.save();

  const orderRes = await request(app)
    .post('/api/orders')
    //@ts-ignore
    .set('Cookie', signin)
    .send({
      boatId: boat.id,
      startDate: '2021/08/14',
      endDate: '2021/08/16',
    })
    .expect(201);

  await request(app)
    .delete(`/api/orders/${orderRes.body.id}`)
    //@ts-ignore
    .set('Cookie', signin)
    .send()
    .expect(204);

  const showRes = await request(app)
    .get(`/api/orders/${orderRes.body.id}`)
    //@ts-ignore
    .set('Cookie', signin)
    .send()
    .expect(200);

  expect(showRes.body.status).toEqual(OrderStatus.Cancelled);
});

//emits an order cancelled event
it('emits an order cancelled event', async () => {
  //@ts-ignore
  const signin = global.signin();
  const boat = Boat.build({
    id: mongoose.Types.ObjectId().toHexString(),
    boatType: 'jhjhsd',
    boatManufacturer: 'Passat',
    boatModel: 'ML350',
    city: 'Lagos',
    boatHarbour: 'Lekki',
    captain: true,
    price: 1000,
    cabins: 10,
    bathrooms: 2,
    lengthOfBoat: 100,
    boatCapicity: 30,
    boatDescription: 'A very good boat!!!',
    photos: ['skhdhfgywefuh'],
  });

  await boat.save();

  const orderRes = await request(app)
    .post('/api/orders')
    //@ts-ignore
    .set('Cookie', signin)
    .send({
      boatId: boat.id,
      startDate: '2021/08/14',
      endDate: '2021/08/16',
    })
    .expect(201);

  await request(app)
    .delete(`/api/orders/${orderRes.body.id}`)
    //@ts-ignore
    .set('Cookie', signin)
    .send()
    .expect(204);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
