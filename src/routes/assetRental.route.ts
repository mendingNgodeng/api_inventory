import { Hono } from 'hono';
import { assetRentalController } from '../controllers/assetRental.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const assetRental = new Hono();

assetRental.get(
  '/',
  assetRentalController.getAll
);

assetRental.get(
  '/:id',
  assetRentalController.get
);

assetRental.post(
  '/',
  assetRentalController.create
);

assetRental.put(
  '/:id/finish',
  assetRentalController.finish
);

assetRental.put(
  '/:id/cancel',
  assetRentalController.cancel
);

// just  the non active
assetRental.delete(
  '/:id',
  assetRentalController.delete
);

// All the non active
assetRental.delete(
  '/nonActive',
  assetRentalController.deleteAllNonActive
);

export default assetRental;