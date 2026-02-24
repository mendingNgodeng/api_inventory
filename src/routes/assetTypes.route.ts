import { Hono } from 'hono';
import { AssetTypesController } from '../controllers/assetTypes.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const assetTypes = new Hono();

assetTypes.get(
  '/', authMiddleware,
  AssetTypesController.getAll
);

assetTypes.get(
  '/:id', authMiddleware,
  AssetTypesController.get
);

assetTypes.post(
  '/', authMiddleware,
  AssetTypesController.create
);

assetTypes.put(
  '/:id', authMiddleware,
  AssetTypesController.update
);

assetTypes.delete(
  '/:id', authMiddleware,
  AssetTypesController.delete
);

export default assetTypes;