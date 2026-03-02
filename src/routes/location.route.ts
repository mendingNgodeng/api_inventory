import { Hono } from 'hono';
import { LocationController } from '../controllers/location.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { rateLimit } from '../middleware/rateLimit';

const location = new Hono();

location.get(
  '/', authMiddleware,
  rateLimit({
     windowSec:Number(process.env.rl_read_windowsSecs),
      max:Number(process.env.rl_read_max),
      keyPrefix:String(process.env.location_prefix)
    }),
  LocationController.getAll
);

location.get(
  '/:id', authMiddleware,

    rateLimit({
     windowSec:Number(process.env.rl_read_windowsSecs),
      max:Number(process.env.rl_read_max),
      keyPrefix:String(process.env.locationById_prefix)
    }),
  LocationController.get
);

location.post(
  '/', authMiddleware,
      rateLimit({
     windowSec:Number(process.env.rl_write_windowsSecs),
      max:Number(process.env.rl_write_max),
      keyPrefix:String(process.env.locationCreate_prefix)
    }),
  LocationController.create
);

location.put(
  '/:id', authMiddleware,
        rateLimit({
     windowSec:Number(process.env.rl_write_windowsSecs),
      max:Number(process.env.rl_write_max),
      keyPrefix:String(process.env.locationUpdate_prefix)
    }),
  LocationController.update
);

location.delete(
  '/:id', authMiddleware,
    rateLimit({
     windowSec:Number(process.env.rl_delete_windowsSecs),
      max:Number(process.env.rl_delete_max),
      keyPrefix:String(process.env.locationDelete_prefix)
    }),
  LocationController.delete
);

export default location;