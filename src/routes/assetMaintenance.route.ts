import { Hono } from 'hono';
import {   assetMaintenaceController } from '../controllers/assetMaintenance.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { rateLimit } from '../middleware/rateLimit';

const assetMaintenance = new Hono();

assetMaintenance.get(
  '/', authMiddleware,
     rateLimit({
   windowSec:Number(process.env.rl_read_windowsSecs),
    max:Number(process.env.rl_read_max),
    keyPrefix:String(process.env.asset_maintenance_prefix)
  }),
  assetMaintenaceController.getAll
);

assetMaintenance.get(
  '/:id', authMiddleware,
  rateLimit({
   windowSec:Number(process.env.rl_read_windowsSecs),
    max:Number(process.env.rl_read_max),
    keyPrefix:String(process.env.asset_maintenanceById_prefix)
  }),
  assetMaintenaceController.get
);

assetMaintenance.post(
  '/', authMiddleware,
   rateLimit({
   windowSec:Number(process.env.rl_read_windowsSecs),
    max:Number(process.env.rl_read_max),
    keyPrefix:String(process.env.asset_maintenanceCreate_prefix)
  }),
  assetMaintenaceController.createMaintenance
);

assetMaintenance.put(
  '/:id/return', authMiddleware,
  rateLimit({
   windowSec:Number(process.env.rl_read_windowsSecs),
    max:Number(process.env.rl_read_max),
    keyPrefix:String(process.env.asset_maintenanceReturn_prefix)
  }),
  assetMaintenaceController.returnAsset
);


assetMaintenance.delete(
  '/:id', authMiddleware,
  rateLimit({
   windowSec:Number(process.env.rl_read_windowsSecs),
    max:Number(process.env.rl_read_max),
    keyPrefix:String(process.env.asset_maintenanceDelete_prefix)
  }),
  assetMaintenaceController.delete
);

export default assetMaintenance;