import { Hono } from 'hono';
import { assetStockController } from '../controllers/assetStock.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { rateLimit } from '../middleware/rateLimit';

const assetStock = new Hono();

assetStock.get(
  '/',
  rateLimit({
     windowSec:Number(process.env.rl_read_windowsSecs),
      max:Number(process.env.rl_read_max),
      keyPrefix:String(process.env.asset_stock_prefix)
    }),
  assetStockController.getAll
);

assetStock.get(
  '/:id',
   rateLimit({
     windowSec:Number(process.env.rl_read_windowsSecs),
      max:Number(process.env.rl_read_max),
      keyPrefix:String(process.env.asset_stockById_prefix)
    }),
  assetStockController.get
);

assetStock.post(
  '/', authMiddleware,
    rateLimit({
     windowSec:Number(process.env.rl_write_windowsSecs),
      max:Number(process.env.rl_write_max),
      keyPrefix:String(process.env.asset_stockCreate_prefix)
    }),
  assetStockController.create
);

assetStock.put(
  '/:id', authMiddleware,
   rateLimit({
     windowSec:Number(process.env.rl_write_windowsSecs),
      max:Number(process.env.rl_write_max),
      keyPrefix:String(process.env.asset_stockUpdate_prefix)
    }),
  assetStockController.update
);

assetStock.delete(
  '/:id', authMiddleware,
     rateLimit({
     windowSec:Number(process.env.rl_delete_windowsSecs),
      max:Number(process.env.rl_delete_max),
      keyPrefix:String(process.env.asset_stockDelete_prefix)
    }),
  assetStockController.delete
);

export default assetStock;