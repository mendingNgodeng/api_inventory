import { Hono } from 'hono';
import { userController } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { rateLimit } from '../middleware/rateLimit';

const user = new Hono();

user.get(
  '/', 
    rateLimit({
     windowSec:Number(process.env.rl_read_windowsSecs),
      max:Number(process.env.rl_read_max),
      keyPrefix:String(process.env.user_prefix)
    }),
  userController.getAll
);

user.get(
  '/:id', authMiddleware,
     rateLimit({
     windowSec:Number(process.env.rl_read_windowsSecs),
      max:Number(process.env.rl_read_max),
      keyPrefix:String(process.env.userById_prefix)
    }),
  userController.get
);

user.post(
  '/', authMiddleware,
       rateLimit({
     windowSec:Number(process.env.rl_write_windowsSecs),
      max:Number(process.env.rl_write_max),
      keyPrefix:String(process.env.userCreate_prefix)
    }),
  userController.create
);

user.put(
  '/:id', authMiddleware,
         rateLimit({
     windowSec:Number(process.env.rl_write_windowsSecs),
      max:Number(process.env.rl_write_max),
      keyPrefix:String(process.env.userUpdate_prefix)
    }),
  userController.update
);

user.delete(
  '/:id', authMiddleware,
           rateLimit({
     windowSec:Number(process.env.rl_delete_windowsSecs),
      max:Number(process.env.rl_delete_max),
      keyPrefix:String(process.env.userDelete_prefix)
    }),
  userController.delete
);


export default user;