import { Hono } from 'hono';
import { AssetCategoryController } from '../controllers/assetCategory.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const asssetCtg = new Hono();

asssetCtg.get(
  '/',
  AssetCategoryController.getAll
);

asssetCtg.get(
  '/:id',
  AssetCategoryController.get
);

asssetCtg.post(
  '/',
  AssetCategoryController.create
);

asssetCtg.put(
  '/:id',
  AssetCategoryController.update
);

asssetCtg.delete(
  '/:id',
  AssetCategoryController.delete
);

export default asssetCtg;