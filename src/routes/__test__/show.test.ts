import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Boat } from '../../models/boat';

const id = mongoose.Types.ObjectId().toHexString();

//returns a 401 if the user is not authenticated
it('returns a 401 if the user is not authenticated', async () => {
  await request(app).get(`/api/orders/${id}`).send().expect(401);
});

//returns a 404 if the order was not found
it('returns a 404 if the order was not found', async () => {
  await request(app)
    .get(`/api/orders/${id}`)
    //@ts-ignore
    .set('Cookie', global.signin())
    .send()
    .expect(404);
});

//returns a 401 if the userId in order is not the same as the logged in user
it('returns a 401 if the userId in the order is not the same as the logged in userId', async () => {
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
    .get(`/api/orders/${orderRes.body.id}`)
    //@ts-ignore
    .set('Cookie', global.signin())
    .send()
    .expect(401);
});
