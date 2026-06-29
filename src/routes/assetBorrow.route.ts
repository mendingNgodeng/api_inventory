import { Hono } from 'hono';
import {  assetBorrowController } from '../controllers/assetBorrow.controller';
// import {  assetBorrowKaryawanController } from '../controllers/assetBorrowKaryawan.controller';
import { authMiddleware, requireRole,requireSelfOrAdmin } from '../middleware/auth.middleware';
import { rateLimit } from '../middleware/rateLimit';

const assetBorrow = new Hono();

assetBorrow.get(
  '/',
  authMiddleware,
  requireRole("KARYAWAN","ADMIN","BOS"),
    rateLimit({
    windowSec:Number(process.env.rl_read_windowsSecs),
    max:Number(process.env.rl_read_max),
    keyPrefix:String(process.env.borrow_get_keyPrefix)
  }),
  assetBorrowController.getAll
);

assetBorrow.get(
  '/:id',
  authMiddleware,
requireSelfOrAdmin,
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
  '/used', 
  authMiddleware,
  requireRole("ADMIN","BOS"),
     rateLimit({
     windowSec:Number(process.env.rl_write_windowsSecs),
    max:Number(process.env.rl_write_max),
    keyPrefix:String(process.env.borrow_assetUse_keyPrefix)
  }),
  assetBorrowController.createUsed
);

// old not used now
// assetBorrow.post(
//   '/borrow',
//   authMiddleware,
//   requireRole("KARYAWAN","ADMIN"),
//       rateLimit({
//      windowSec:Number(process.env.rl_write_windowsSecs),
//     max:Number(process.env.rl_write_max),
//     keyPrefix:String(process.env.borrow_asset_keyPrefix)
//   }),
//   assetBorrowController.createBorrow
// );

assetBorrow.post(
  "/borrow",
  authMiddleware,
  requireRole("KARYAWAN", "ADMIN", "BOS"),
  rateLimit({
    windowSec: Number(process.env.rl_write_windowsSecs),
    max: Number(process.env.rl_write_max),
    keyPrefix: String(process.env.borrow_asset_keyPrefix),
  }),
  assetBorrowController.requestBorrow
);

// approval tahap admin
assetBorrow.put(
  "/:id/approve-admin",
  authMiddleware,
  requireRole("ADMIN"),
  rateLimit({
    windowSec: Number(process.env.rl_write_windowsSecs),
    max: Number(process.env.rl_write_max),
    keyPrefix: String(process.env.borrow_approve_admin_keyPrefix),
  }),
  assetBorrowController.approveByAdmin
);

// approval tahap bos
assetBorrow.put(
  "/:id/approve-boss",
  authMiddleware,
  requireRole("BOS"),
  rateLimit({
    windowSec: Number(process.env.rl_write_windowsSecs),
    max: Number(process.env.rl_write_max),
    keyPrefix: String(process.env.borrow_approve_boss_keyPrefix),
  }),
  assetBorrowController.approveByBoss
);

// reject request
assetBorrow.put(
  "/:id/reject",
  authMiddleware,
  requireRole("ADMIN", "BOS"),
  rateLimit({
    windowSec: Number(process.env.rl_write_windowsSecs),
    max: Number(process.env.rl_write_max),
    keyPrefix: String(process.env.borrow_reject_keyPrefix),
  }),
  assetBorrowController.rejectBorrow
);


// assetBorrow.put(
//   '/:id',
//   assetBorrowController.update
// );

assetBorrow.put(
  '/:id/return',
  authMiddleware,
  requireRole("KARYAWAN", "ADMIN", "BOS"),
  rateLimit({
   windowSec:Number(process.env.rl_delete_windowsSecs),
    max:Number(process.env.rl_delete_max),
    keyPrefix:String(process.env.borrow_return_keyPrefix)
  }),
  assetBorrowController.returnAsset
);

assetBorrow.put(
  "/:id/cancel",
  authMiddleware,
  requireRole("KARYAWAN", "ADMIN", "BOS"),
  rateLimit({
    windowSec: Number(process.env.rl_write_windowsSecs),
    max: Number(process.env.rl_write_max),
    keyPrefix: String(process.env.borrow_cancel_keyPrefix),
  }),
  assetBorrowController.cancelBorrow
);

// assetBorrow.delete(
//   '/:id', authMiddleware,
//   rateLimit({
//     windowSec:Number(process.env.borrow_delete_windowsSec),
//     max:Number(process.env.borrow_delete_max),
//     keyPrefix:String(process.env.borrow_delete_keyPrefix)
//   }),
//   assetBorrowController.delete
// );

export default assetBorrow;