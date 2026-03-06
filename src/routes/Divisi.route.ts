import { Hono } from 'hono';
import { divisiController } from '../controllers/divisi.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { rateLimit } from '../middleware/rateLimit';

const divisi = new Hono();

divisi.get(
  '/', authMiddleware,
  rateLimit({
     windowSec:Number(process.env.rl_read_windowsSecs),
      max:Number(process.env.rl_read_max),
      keyPrefix:String(process.env.divisi_prefix ?? "divisi")
    }),
  divisiController.getAll
);

divisi.get(
  '/:id', authMiddleware,

    rateLimit({
     windowSec:Number(process.env.rl_read_windowsSecs),
      max:Number(process.env.rl_read_max),
      keyPrefix:String(process.env.divisiById_prefix ?? "divisi")
    }),
  divisiController.get
);

divisi.post(
  '/', authMiddleware,
      rateLimit({
     windowSec:Number(process.env.rl_write_windowsSecs),
      max:Number(process.env.rl_write_max),
      keyPrefix:String(process.env.divisiCreate_prefix ?? "divisi")
    }),
  divisiController.create
);

divisi.put(
  '/:id', authMiddleware,
        rateLimit({
     windowSec:Number(process.env.rl_write_windowsSecs),
      max:Number(process.env.rl_write_max),
      keyPrefix:String(process.env.divisiUpdate_prefix ?? "divisi")
    }),
  divisiController.update
);

divisi.delete(
  '/:id', authMiddleware,
    rateLimit({
     windowSec:Number(process.env.rl_delete_windowsSecs),
      max:Number(process.env.rl_delete_max),
      keyPrefix:String(process.env.divisiDelete_prefix ?? "divisi")
    }),
  divisiController.delete
);

export default divisi;