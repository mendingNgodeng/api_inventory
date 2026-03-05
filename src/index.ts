import { Hono } from 'hono';
import authRoute from './routes/auth.route';
import assetCtg from './routes/assetCategory.route';
import assetTypes from './routes/assetTypes.route';
import location from './routes/location.route';
import user from './routes/user.route';
import asset from './routes/asset.route';
import assetStock from './routes/assetStock.route';
import rentalCustomer from './routes/rentalCustomer.route';
import assetBorrow from './routes/assetBorrow.route';
import assetMaintenance from './routes/assetMaintenance.route';
import statistic from './routes/statistic.route';
import assetRental from './routes/assetRental.route'
import assetLogs from './routes/assetLogs.route'




import { cors } from 'hono/cors';
const app = new Hono();

// app.get('/', (c) => {
//   return c.text('Hello Hono!')
// })S

app.use(
  '/*',
  cors({
    origin: '*', // nanti bisa diganti 'http://localhost:5173 and what not'
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
app.route('/assetBorrow', assetBorrow);
app.route('/assetMaintenance', assetMaintenance);
app.route('/assetRental', assetRental);
app.route('/statistic', statistic);
app.route('/assetLogs', assetLogs);

const port = Number(process.env.PORT) || 3000

Bun.serve({
  port,
  fetch: app.fetch
})

// console.log(`Server running on port ${port}`)
// export default app;