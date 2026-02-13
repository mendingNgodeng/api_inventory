import { Hono } from 'hono';
import { assetController } from '../controllers/asset.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const asset = new Hono();

asset.get(
  '/',
  assetController.getAll
);

asset.get(
  '/:id',
  assetController.get
);

asset.post(
  '/',
  assetController.create
);

asset.put(
  '/:id',
  assetController.update
);

asset.delete(
  '/:id',
  assetController.delete
);

export default asset;