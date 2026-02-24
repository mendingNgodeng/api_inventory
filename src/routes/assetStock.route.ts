import { Hono } from 'hono';
import { assetStockController } from '../controllers/assetStock.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const assetStock = new Hono();

assetStock.get(
  '/',
  assetStockController.getAll
);

assetStock.get(
  '/:id',
  assetStockController.get
);

assetStock.post(
  '/', authMiddleware,
  assetStockController.create
);

assetStock.put(
  '/:id', authMiddleware,
  assetStockController.update
);

assetStock.delete(
  '/:id', authMiddleware,
  assetStockController.delete
);

export default assetStock;