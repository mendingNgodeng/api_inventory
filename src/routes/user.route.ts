import { Hono } from 'hono';
import { userController } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const user = new Hono();

user.get(
  '/', 
  userController.getAll
);

user.get(
  '/:id', authMiddleware,
  userController.get
);

user.post(
  '/', authMiddleware,
  userController.create
);

user.put(
  '/:id', authMiddleware,
  userController.update
);

user.delete(
  '/:id', authMiddleware,
  userController.delete
);

export default user;