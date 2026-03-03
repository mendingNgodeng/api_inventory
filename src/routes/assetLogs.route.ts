import { Hono } from "hono";
import { assetLogsController } from "../controllers/assetLogs.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { rateLimit } from "../middleware/rateLimit";

const assetLogs = new Hono();

// =============================
// GET ALL LOGS
// =============================
assetLogs.get(
  "/",
  authMiddleware,
  rateLimit({
    windowSec: Number(process.env.rl_read_windowsSecs),
    max: Number(process.env.rl_read_max),
    keyPrefix: String(process.env.assetLogs_get_keyPrefix),
  }),
  assetLogsController.getAll
);

// =============================
// GROUPED ROUTES (taruh sebelum /:id)
// =============================

assetLogs.get(
  "/location",
  authMiddleware,
  rateLimit({
    windowSec: Number(process.env.rl_read_windowsSecs),
    max: Number(process.env.rl_read_max),
    keyPrefix: String(process.env.assetLogs_location_keyPrefix),
  }),
  assetLogsController.getLocation
);

assetLogs.get(
  "/rental-customer",
  authMiddleware,
  rateLimit({
    windowSec: Number(process.env.rl_read_windowsSecs),
    max: Number(process.env.rl_read_max),
    keyPrefix: String(process.env.assetLogs_rentalCustomer_keyPrefix),
  }),
  assetLogsController.getRentalCustomer
);

assetLogs.get(
  "/user",
  authMiddleware,
  rateLimit({
    windowSec: Number(process.env.rl_read_windowsSecs),
    max: Number(process.env.rl_read_max),
    keyPrefix: String(process.env.assetLogs_user_keyPrefix),
  }),
  assetLogsController.getUser
);

assetLogs.get(
  "/asset",
  authMiddleware,
  rateLimit({
    windowSec: Number(process.env.rl_read_windowsSecs),
    max: Number(process.env.rl_read_max),
    keyPrefix: String(process.env.assetLogs_asset_keyPrefix),
  }),
  assetLogsController.getAsset
);

assetLogs.get(
  "/asset-stock",
  authMiddleware,
  rateLimit({
    windowSec: Number(process.env.rl_read_windowsSecs),
    max: Number(process.env.rl_read_max),
    keyPrefix: String(process.env.assetLogs_assetStock_keyPrefix),
  }),
  assetLogsController.getAssetStock
);

assetLogs.get(
  "/types",
  authMiddleware,
  rateLimit({
    windowSec: Number(process.env.rl_read_windowsSecs),
    max: Number(process.env.rl_read_max),
    keyPrefix: String(process.env.assetLogs_types_keyPrefix),
  }),
  assetLogsController.getTypes
);

assetLogs.get(
  "/categories",
  authMiddleware,
  rateLimit({
    windowSec: Number(process.env.rl_read_windowsSecs),
    max: Number(process.env.rl_read_max),
    keyPrefix: String(process.env.assetLogs_categories_keyPrefix),
  }),
  assetLogsController.getCategories
);

assetLogs.get(
  "/rental",
  authMiddleware,
  rateLimit({
    windowSec: Number(process.env.rl_read_windowsSecs),
    max: Number(process.env.rl_read_max),
    keyPrefix: String(process.env.assetLogs_rental_keyPrefix),
  }),
  assetLogsController.getRental
);

assetLogs.get(
  "/borrow",
  authMiddleware,
  rateLimit({
    windowSec: Number(process.env.rl_read_windowsSecs),
    max: Number(process.env.rl_read_max),
    keyPrefix: String(process.env.assetLogs_borrow_keyPrefix),
  }),
  assetLogsController.getBorrow
);

assetLogs.get(
  "/maintenance",
  authMiddleware,
  rateLimit({
    windowSec: Number(process.env.rl_read_windowsSecs),
    max: Number(process.env.rl_read_max),
    keyPrefix: String(process.env.assetLogs_maintenance_keyPrefix),
  }),
  assetLogsController.getMaintenance
);

// =============================
// GET BY ID (taruh paling bawah)
// =============================
assetLogs.get(
  "/:id",
  authMiddleware,
  rateLimit({
    windowSec: Number(process.env.rl_read_windowsSecs),
    max: Number(process.env.rl_read_max),
    keyPrefix: String(process.env.assetLogs_getById_keyPrefix),
  }),
  assetLogsController.get
);

export default assetLogs;