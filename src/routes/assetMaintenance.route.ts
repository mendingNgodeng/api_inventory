import { Hono } from 'hono';
import {   assetMaintenaceController } from '../controllers/assetMaintenance.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const assetMaintenance = new Hono();

assetMaintenance.get(
  '/',
  assetMaintenaceController.getAll
);

assetMaintenance.get(
  '/:id',
  assetMaintenaceController.get
);

assetMaintenance.post(
  '/',
  assetMaintenaceController.createMaintenance
);

// assetMaintenance.put(
//   '/:id',
//   assetMaintenaceController .update
// );

assetMaintenance.put(
  '/:id/return',
  assetMaintenaceController.returnAsset
);


assetMaintenance.delete(
  '/:id',
  assetMaintenaceController.delete
);

export default assetMaintenance;