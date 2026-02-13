import { Hono } from 'hono';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';


const auth = new Hono();

auth.post(
  '/register',
  AuthController.register
);

auth.post(
  '/login',
  AuthController.login
);

auth.post('/logout',authMiddleware,
   AuthController.logout
);

export default auth;