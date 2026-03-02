import { Hono } from 'hono';
import { assetController } from '../controllers/asset.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { rateLimit } from '../middleware/rateLimit';

const asset = new Hono();

asset.get(
  '/', 
  authMiddleware,
   rateLimit({
    windowSec:10,
    max:10,
    keyPrefix:'rl:Asset'
  }),
  assetController.getAll
);

asset.get(
  '/:id',authMiddleware,
  rateLimit({
    windowSec:10,
    max:10,
    keyPrefix:'rl:AssetById'
  }),
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