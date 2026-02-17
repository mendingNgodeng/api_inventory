import { Hono } from 'hono';
import authRoute from './routes/auth.route';
import assetCtg from './routes/assetCategory.route';
import assetTypes from './routes/assetTypes.route';
import location from './routes/location.route';
import user from './routes/user.route';
import asset from './routes/asset.route';
import assetStock from './routes/assetStock.route';
import rentalCustomer from './routes/rentalCustomer.route';

import { cors } from 'hono/cors';
const app = new Hono();

// app.get('/', (c) => {
//   return c.text('Hello Hono!')
// })S

app.use(
  '/*',
  cors({
    origin: '*', // nanti bisa diganti 'http://localhost:5173'
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
);

app.route('/auth', authRoute);
app.route('/assetCtg', assetCtg);
app.route('/assetTypes', assetTypes);
app.route('/location', location);
app.route('/asset', asset);
app.route('/user', user);
app.route('/rentalCustomer', rentalCustomer);
app.route('/assetStock', assetStock);




export default app;