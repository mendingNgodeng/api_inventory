import { Hono } from 'hono';
import { AssetTypesController } from '../controllers/assetTypes.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { rateLimit } from '../middleware/rateLimit';

const assetTypes = new Hono();

assetTypes.get(
  '/', authMiddleware,
rateLimit({
     windowSec:Number(process.env.rl_read_windowsSecs),
      max:Number(process.env.rl_read_max),
      keyPrefix:String(process.env.asset_types_prefix)
    }),
  AssetTypesController.getAll
);

assetTypes.get(
  '/:id', authMiddleware,
  rateLimit({
     windowSec:Number(process.env.rl_read_windowsSecs),
      max:Number(process.env.rl_read_max),
      keyPrefix:String(process.env.asset_typesById_prefix)
    }),
  AssetTypesController.get
);

assetTypes.post(
  '/', authMiddleware,
   rateLimit({
     windowSec:Number(process.env.rl_write_windowsSecs),
      max:Number(process.env.rl_write_max),
      keyPrefix:String(process.env.asset_typesCreate_prefix)
    }),
  AssetTypesController.create
);

assetTypes.put(
  '/:id', authMiddleware,
     rateLimit({
     windowSec:Number(process.env.rl_write_windowsSecs),
      max:Number(process.env.rl_write_max),
      keyPrefix:String(process.env.asset_typesUpdate_prefix)
    }),
  AssetTypesController.update
);

assetTypes.delete(
  '/:id', authMiddleware,
   rateLimit({
     windowSec:Number(process.env.rl_delete_windowsSecs),
      max:Number(process.env.rl_delete_max),
      keyPrefix:String(process.env.asset_typesDelete_prefix)
    }),
  AssetTypesController.delete
);

export default assetTypes;