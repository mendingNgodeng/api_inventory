import { Hono } from 'hono';
import { userController } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const user = new Hono();

user.get(
  '/',
  userController.getAll
);

user.get(
  '/:id',
  userController.get
);

user.post(
  '/',
  userController.create
);

user.put(
  '/:id',
  userController.update
);

user.delete(
  '/:id',
  userController.delete
);

export default user;