import { Hono } from 'hono';
import { assetRentalController } from '../controllers/assetRental.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const assetRental = new Hono();

assetRental.get(
  '/',
  authMiddleware,
  assetRentalController.getAll
);

assetRental.get(
  '/:id',
  authMiddleware,
  assetRentalController.get
);

assetRental.post(
  '/',
  authMiddleware,
  assetRentalController.create
);

assetRental.put(
  '/:id/finish',
  authMiddleware,
  assetRentalController.finish
);

assetRental.put(
  '/:id/cancel',
  authMiddleware,
  assetRentalController.cancel
);

// just  the non active
assetRental.delete(
  '/:id',
  authMiddleware,
  assetRentalController.delete
);

// All the non active
assetRental.delete(
  '/nonActive',
  authMiddleware,
  assetRentalController.deleteAllNonActive
);

export default assetRental;