import { Hono } from 'hono';
import { assetRentalController } from '../controllers/assetRental.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { rateLimit } from '../middleware/rateLimit';

const assetRental = new Hono();

assetRental.get(
  '/',
  authMiddleware,
     rateLimit({
     windowSec:Number(process.env.rl_read_windowsSecs),
      max:Number(process.env.rl_read_max),
      keyPrefix:String(process.env.asset_rental_prefix)
    }),
  assetRentalController.getAll
);

assetRental.get(
  '/:id',
  authMiddleware,
  rateLimit({
  windowSec:Number(process.env.rl_read_windowsSecs),
   max:Number(process.env.rl_read_max),
   keyPrefix:String(process.env.asset_rentalById_prefix)
 }),
  assetRentalController.get
);

assetRental.post(
  '/',
  authMiddleware,
    rateLimit({
  windowSec:Number(process.env.rl_write_windowsSecs),
   max:Number(process.env.rl_write_max),
   keyPrefix:String(process.env.asset_rentalCreate_prefix)
 }),
  assetRentalController.create
);

assetRental.put(
  '/:id/finish',
  authMiddleware,
      rateLimit({
  windowSec:Number(process.env.rl_write_windowsSecs),
   max:Number(process.env.rl_write_max),
   keyPrefix:String(process.env.asset_rentalFinish_prefix)
 }),
  assetRentalController.finish
);

assetRental.put(
  '/:id/pay',
  authMiddleware,
      rateLimit({
  windowSec:Number(process.env.rl_write_windowsSecs),
   max:Number(process.env.rl_write_max),
   keyPrefix:String(process.env.asset_rentalFinish_prefix)
 }),
  assetRentalController.payRental
);

assetRental.put(
  '/:id/cancel',
  authMiddleware,
    rateLimit({
  windowSec:Number(process.env.rl_write_windowsSecs),
   max:Number(process.env.rl_write_max),
   keyPrefix:String(process.env.asset_rentalCancel_prefix)
 }),
  assetRentalController.cancel
);

// // just  the non active
// assetRental.delete(
//   '/:id',
//   authMiddleware,
//   rateLimit({
//   windowSec:Number(process.env.rl_delete_windowsSecs),
//    max:Number(process.env.rl_delete_max),
//    keyPrefix:String(process.env.asset_rentalDelete_prefix)
//  }),
//   assetRentalController.delete
// );

// // All the non active
// assetRental.delete(
//   '/nonActive',
//   authMiddleware,
//     rateLimit({
//   windowSec:Number(process.env.rl_delete_windowsSecs),
//    max:Number(process.env.rl_delete_max),
//    keyPrefix:String(process.env.asset_rentalDelete_prefix)
//  }),
//   assetRentalController.deleteAllNonActive
// );

export default assetRental;