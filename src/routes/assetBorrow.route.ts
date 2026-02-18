import { Hono } from 'hono';
import {  assetBorrowController } from '../controllers/assetBorrow.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const assetBorrow = new Hono();

assetBorrow.get(
  '/',
  assetBorrowController.getAll
);

assetBorrow.get(
  '/:id',
  assetBorrowController.get
);

assetBorrow.post(
  '/',
  assetBorrowController.create
);

assetBorrow.post(
  '/used',
  assetBorrowController.createUsed
);


assetBorrow.post(
  '/borrow',
  assetBorrowController.createBorrow
);

assetBorrow.put(
  '/:id',
  assetBorrowController.update
);

assetBorrow.put(
  '/:id/return',
  assetBorrowController.returnAsset
);


assetBorrow.delete(
  '/:id',
  assetBorrowController.delete
);

export default assetBorrow;