import { Hono } from 'hono';
import {  assetBorrowController } from '../controllers/assetBorrow.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { rateLimit } from '../middleware/rateLimit';

const assetBorrow = new Hono();

assetBorrow.get(
  '/',
    rateLimit({
    windowSec:Number(process.env.rl_read_windowsSecs),
    max:Number(process.env.rl_read_max),
    keyPrefix:String(process.env.borrow_get_keyPrefix)
  }),
  assetBorrowController.getAll
);

assetBorrow.get(
  '/:id',
    rateLimit({
    windowSec:Number(process.env.rl_read_windowsSecs),
    max:Number(process.env.rl_read_max),
    keyPrefix:String(process.env.borrow_get_keyPrefix)
  }),
  assetBorrowController.get
);

// assetBorrow.post(
//   '/',
//   assetBorrowController.create
// );

assetBorrow.post(
  '/used', authMiddleware,
     rateLimit({
     windowSec:Number(process.env.rl_write_windowsSecs),
    max:Number(process.env.rl_write_max),
    keyPrefix:String(process.env.borrow_assetUse_keyPrefix)
  }),
  assetBorrowController.createUsed
);


assetBorrow.post(
  '/borrow',
      rateLimit({
     windowSec:Number(process.env.rl_write_windowsSecs),
    max:Number(process.env.rl_write_max),
    keyPrefix:String(process.env.borrow_asset_keyPrefix)
  }),
  assetBorrowController.createBorrow
);

// assetBorrow.put(
//   '/:id',
//   assetBorrowController.update
// );

assetBorrow.put(
  '/:id/return',
  rateLimit({
   windowSec:Number(process.env.rl_delete_windowsSecs),
    max:Number(process.env.rl_delete_max),
    keyPrefix:String(process.env.borrow_return_keyPrefix)
  }),
  assetBorrowController.returnAsset
);


assetBorrow.delete(
  '/:id', authMiddleware,
  rateLimit({
    windowSec:Number(process.env.borrow_delete_windowsSec),
    max:Number(process.env.borrow_delete_max),
    keyPrefix:String(process.env.borrow_delete_keyPrefix)
  }),
  assetBorrowController.delete
);

export default assetBorrow;