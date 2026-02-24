import { Hono } from 'hono';
import { assetController } from '../controllers/asset.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const asset = new Hono();

asset.get(
  '/', authMiddleware,
  assetController.getAll
);

asset.get(
  '/:id',authMiddleware,
  assetController.get
);

asset.post(
  '/',authMiddleware,
  assetController.create
);

asset.put(
  '/:id',authMiddleware,
  assetController.update
);

asset.delete(
  '/:id',authMiddleware,
  assetController.delete
);

export default asset;