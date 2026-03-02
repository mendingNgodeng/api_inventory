import { Hono } from 'hono';
import { assetController } from '../controllers/asset.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { rateLimit } from '../middleware/rateLimit';

const asset = new Hono();

asset.get(
  '/', 
  authMiddleware,
   rateLimit({
    windowSec:Number(process.env.rl_read_windowsSecs),
    max:Number(process.env.rl_read_max),
    keyPrefix:String(process.env.asset_get_keyPrefix)
  }),
  assetController.getAll
);

asset.get(
  '/:id',authMiddleware,
  rateLimit({
    windowSec:Number(process.env.rl_read_windowsSecs),
    max:Number(process.env.rl_read_max),
    keyPrefix:String(process.env.asset_getById_keyPrefix)
  }),
  assetController.get
);

asset.post(
  '/',authMiddleware,
  rateLimit({
    windowSec:Number(process.env.rl_write_windowsSecs),
    max:Number(process.env.rl_write_max),
    keyPrefix:String(process.env.asset_create_keyPrefix)
  }),
  assetController.create
);

asset.put(
  '/:id',authMiddleware,
   rateLimit({
    windowSec:Number(process.env.rl_write_windowsSecs),
    max:Number(process.env.rl_write_max),
    keyPrefix:String(process.env.asset_update_keyPrefix)
  }),
  assetController.update
);

asset.delete(
  '/:id',authMiddleware,
     rateLimit({
    windowSec:Number(process.env.rl_delete_windowsSecs),
    max:Number(process.env.rl_delete_max),
    keyPrefix:String(process.env.asset_delete_keyPrefix)
  }),
  assetController.delete
);

export default asset;