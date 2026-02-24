import { Hono } from 'hono';
import {   assetMaintenaceController } from '../controllers/assetMaintenance.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const assetMaintenance = new Hono();

assetMaintenance.get(
  '/', authMiddleware,
  assetMaintenaceController.getAll
);

assetMaintenance.get(
  '/:id', authMiddleware,
  assetMaintenaceController.get
);

assetMaintenance.post(
  '/', authMiddleware,
  assetMaintenaceController.createMaintenance
);

// assetMaintenance.put(
//   '/:id',
//   assetMaintenaceController .update
// );

assetMaintenance.put(
  '/:id/return', authMiddleware,
  assetMaintenaceController.returnAsset
);


assetMaintenance.delete(
  '/:id', authMiddleware,
  assetMaintenaceController.delete
);

export default assetMaintenance;