import { Hono } from 'hono';
import { rentalCustomerController } from '../controllers/rentalCustomer.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { rateLimit } from '../middleware/rateLimit';

const rentalCustomer = new Hono();

rentalCustomer.get(
  '/',
  authMiddleware,
  rateLimit({
     windowSec:Number(process.env.rl_read_windowsSecs),
      max:Number(process.env.rl_read_max),
      keyPrefix:String(process.env.rentalCustomer_prefix)
    }),
  rentalCustomerController.getAll
);

rentalCustomer.get(
  '/:id',
  authMiddleware,
  rateLimit({
     windowSec:Number(process.env.rl_read_windowsSecs),
      max:Number(process.env.rl_read_max),
      keyPrefix:String(process.env.rentalCustomerById_prefix)
    }),
  rentalCustomerController.get
);

rentalCustomer.post(
  '/',
  authMiddleware,
  rateLimit({
     windowSec:Number(process.env.rl_write_windowsSecs),
      max:Number(process.env.rl_write_max),
      keyPrefix:String(process.env.rentalCustomerCreate_prefix)
    }),
  rentalCustomerController.create
);

rentalCustomer.put(
  '/:id',
  authMiddleware,
  rateLimit({
     windowSec:Number(process.env.rl_write_windowsSecs),
      max:Number(process.env.rl_write_max),
      keyPrefix:String(process.env.rentalCustomerUpdate_prefix)
    }),
  rentalCustomerController.update
);

rentalCustomer.delete(
  '/:id',
  authMiddleware,
 rateLimit({
     windowSec:Number(process.env.rl_delete_windowsSecs),
      max:Number(process.env.rl_delete_max),
      keyPrefix:String(process.env.rentalCustomerDelete_prefix)
    }),
  rentalCustomerController.delete
);

export default rentalCustomer;