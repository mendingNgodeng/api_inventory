import { Hono } from 'hono';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { rateLimit } from '../middleware/rateLimit';
import { enableRegister } from "../middleware/enableRegister";


const auth = new Hono();

auth.post(
  '/register', 
  enableRegister, 
  AuthController.register
);

auth.post(
  '/login',
  rateLimit({
    windowSec:Number(process.env.login_windowsSec),
    max:Number(process.env.login_max),
    keyPrefix:process.env.login_keyPrefix
  }),
  AuthController.login
);

auth.post('/logout'
  ,authMiddleware,
   rateLimit({
    windowSec:Number(process.env.logout_windowsSec),
    max:Number(process.env.logout_max),
    keyPrefix:process.env.logout_keyPrefix
  }),
   AuthController.logout
);

export default auth;