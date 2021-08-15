import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import { Boat } from '../../models/boat';
import { response } from 'express';

//returns status other than 404 if the route exist
it('returns a status other than 404 if the route exist', async () => {
  const response = await request(app).get('/api/orders').send();

  expect(response.status).not.toEqual(404);
});

//returns a 401 if the user is not authenticated
it('returns a 401 if the user is not authenticated', async () => {
  await request(app).get('/api/orders').send().expect(401);
});

//returns a 200 if the orders are found
it('returns a 200 if the orders are found', async () => {
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

  const ordersRes = await request(app)
    .post('/api/orders')
    //@ts-ignore
    .set('Cookie', signin)
    .send({
      boatId: boat.id,
      startDate: '2021/08/14',
      endDate: '2021/08/16',
    })
    .expect(201);

  const response = await request(app)
    .get('/api/orders')
    .set('Cookie', signin)
    .send()
    .expect(200);

  expect(response.body[0].boatId).toEqual(ordersRes.body.boatId);
  expect(response.body[0].startDate).toEqual(ordersRes.body.startDate);
  expect(response.body[0].endDate).toEqual(ordersRes.body.endDate);
});
