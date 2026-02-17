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
  '/',
  assetStockController.create
);

assetStock.put(
  '/:id',
  assetStockController.update
);

assetStock.delete(
  '/:id',
  assetStockController.delete
);

export default assetStock;