import { Hono } from 'hono';
import { LocationController } from '../controllers/location.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const location = new Hono();

location.get(
  '/', authMiddleware,
  LocationController.getAll
);

location.get(
  '/:id', authMiddleware,
  LocationController.get
);

location.post(
  '/', authMiddleware,
  LocationController.create
);

location.put(
  '/:id', authMiddleware,
  LocationController.update
);

location.delete(
  '/:id', authMiddleware,
  LocationController.delete
);

export default location;