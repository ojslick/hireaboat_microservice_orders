import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Boat } from '../../models/boat';

//has a route to /api/orders
it('has a route to /api/orders', async () => {
  const response = await request(app).post('/api/orders').send({});

  expect(response.status).not.toEqual(404);
});

//it returns not authorized error if the user is unauthorized
it('it returns not authorized error if the user is unauthorized', async () => {
  await request(app).post('/api/orders').send({}).expect(401);
});

//returns a status other than 401 if the user is signed in
it('returns a status other than 401 if the user is signed in', async () => {
  const response = await request(app)
    .post('/api/orders')
    //@ts-ignore
    .set('Cookie', global.signin())
    .send({});

  expect(response.status).not.toEqual(401);
});

//returns a 400 if invalid boatId is provided
it('returns a 400 if invalid boatId is provided', async () => {
  await request(app)
    .post('/api/orders')
    //@ts-ignore
    .set('Cookie', global.signin())
    .send({ boatId: '', startDate: '2021/08/14', endDate: '2021/08/16' })
    .expect(400);

  await request(app)
    .post('/api/orders')
    //@ts-ignore
    .set('Cookie', global.signin())
    .send({ startDtae: '2021/08/14', endDate: '2021/08/16' })
    .expect(400);
});

//returns a 400 if invalid startDate is provided
it('returns a 400 if invalid startDate is provided', async () => {
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

  await request(app)
    .post('/api/orders')
    //@ts-ignore
    .set('Cookie', global.signin())
    .send({
      boatId: boat.id,
      startDate: 893273,
      endDate: '2021/08/14',
    })
    .expect(400);

  await request(app)
    .post('/api/orders')
    //@ts-ignore
    .set('Cookie', global.signin())
    .send({
      boatId: boat.id,
      startDate: '',
      endDate: '2021/08/16',
    })
    .expect(400);
});
//returns a 400 if invalid endDate is provided
it('returns a 400 if invalid endDate is provided', async () => {
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

  await request(app)
    .post('/api/orders')
    //@ts-ignore
    .set('Cookie', global.signin())
    .send({
      boatId: boat.id,
      startDate: '2021/08/14',
      endDate: 29839,
    })
    .expect(400);

  await request(app)
    .post('/api/orders')
    //@ts-ignore
    .set('Cookie', global.signin())
    .send({
      boatId: boat.id,
      startDate: '2021/08/14',
      endDate: '',
    })
    .expect(400);
});

//returns a 404 if the boatId was not found
it('returns a 404 if the boatId was not found', async () => {
  const id = mongoose.Types.ObjectId().toHexString();
  await request(app)
    .post('/api/orders')
    //@ts-ignore
    .set('Cookie', global.signin())
    .send({
      boatId: id,
      startDate: '2021/08/14',
      endDate: '2021/08/16',
    })
    .expect(404);
});

//returns a 400 if the boat is already reserved
it('returns a 400 if the boat is already reserved', async () => {
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

  await request(app)
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
    .post('/api/orders')
    //@ts-ignore
    .set('Cookie', global.signin())
    .send({
      boatId: boat.id,
      startDate: '2021/08/14',
      endDate: '2021/08/16',
    })
    .expect(400);
});
