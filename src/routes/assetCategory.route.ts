import { Hono } from 'hono';
import { AssetCategoryController } from '../controllers/assetCategory.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const asssetCtg = new Hono();

asssetCtg.get(
  '/', authMiddleware,
  AssetCategoryController.getAll
);

asssetCtg.get(
  '/:id', authMiddleware,
  AssetCategoryController.get
);

asssetCtg.post(
  '/',authMiddleware,
  AssetCategoryController.create
);

asssetCtg.put(
  '/:id',authMiddleware,
  AssetCategoryController.update
);

asssetCtg.delete(
  '/:id',authMiddleware,
  AssetCategoryController.delete
);

export default asssetCtg;