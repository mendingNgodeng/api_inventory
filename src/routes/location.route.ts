import { Hono } from 'hono';
import { LocationController } from '../controllers/location.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const location = new Hono();

location.get(
  '/',
  LocationController.getAll
);

location.get(
  '/:id',
  LocationController.get
);

location.post(
  '/',
  LocationController.create
);

location.put(
  '/:id',
  LocationController.update
);

location.delete(
  '/:id',
  LocationController.delete
);

export default location;