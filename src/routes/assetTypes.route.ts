import { Hono } from 'hono';
import { AssetTypesController } from '../controllers/assetTypes.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const assetTypes = new Hono();

assetTypes.get(
  '/',
  AssetTypesController.getAll
);

assetTypes.get(
  '/:id',
  AssetTypesController.get
);

assetTypes.post(
  '/',
  AssetTypesController.create
);

assetTypes.put(
  '/:id',
  AssetTypesController.update
);

assetTypes.delete(
  '/:id',
  AssetTypesController.delete
);

export default assetTypes;