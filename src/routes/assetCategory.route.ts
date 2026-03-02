import { Hono } from 'hono';
import { AssetCategoryController } from '../controllers/assetCategory.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { rateLimit } from '../middleware/rateLimit';

const asssetCtg = new Hono();

asssetCtg.get(
  '/', 
  authMiddleware,
   rateLimit({
   windowSec:Number(process.env.rl_read_windowsSecs),
    max:Number(process.env.rl_read_max),
    keyPrefix:String(process.env.asset_category_prefix)
  }),
  AssetCategoryController.getAll
);

asssetCtg.get(
  '/:id', authMiddleware,
  rateLimit({
   windowSec:Number(process.env.rl_read_windowsSecs),
    max:Number(process.env.rl_read_max),
    keyPrefix:String(process.env.asset_categoryById_prefix)
  }),
  AssetCategoryController.get
);

asssetCtg.post(
  '/',authMiddleware,
    rateLimit({
   windowSec:Number(process.env.rl_write_windowsSecs),
    max:Number(process.env.rl_write_max),
    keyPrefix:String(process.env.asset_categoryCreate_prefix)
  }),
  AssetCategoryController.create
);

asssetCtg.put(
  '/:id',authMiddleware,
   rateLimit({
   windowSec:Number(process.env.rl_write_windowsSecs),
    max:Number(process.env.rl_write_max),
    keyPrefix:String(process.env.asset_categoryUpdate_prefix)
  }),
  AssetCategoryController.update
);

asssetCtg.delete(
  '/:id',authMiddleware,
    rateLimit({
   windowSec:Number(process.env.rl_delete_windowsSecs),
    max:Number(process.env.rl_delete_max),
    keyPrefix:String(process.env.asset_categoryDelete_prefix)
  }),
  AssetCategoryController.delete
);

export default asssetCtg;