import { Hono } from 'hono';
import { statisticController } from '../controllers/statistic.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { rateLimit } from '../middleware/rateLimit';

const statistic = new Hono();

statistic.get(
  '/rankCtgByStock',
  authMiddleware,
  rateLimit({
     windowSec:Number(process.env.rl_read_windowsSecs),
      max:Number(process.env.rl_read_max),
      keyPrefix:String(process.env.rankByCtg_prefix)
    }),
  statisticController.getCategoryRankingByStock
);

statistic.get(
  '/getDashboardSummary',
  authMiddleware,
  rateLimit({
     windowSec:Number(process.env.rl_read_windowsSecs),
      max:Number(process.env.rl_read_max),
      keyPrefix:String(process.env.dashboardsummary_prefix)
    }),
  statisticController.getDashboardSummary
);


// already in summary
// statistic.get(
//   '/totalUser',
//   statisticController.totalUser
// );

// statistic.get(
//   '/totalAssetKinds',
//   statisticController.totalAssetKinds
// );

// statistic.get(
//   '/totalUsedAsset',
//   statisticController.totalUsedAsset
// );


// statistic.get(
//   '/totalAsset',
//   statisticController.totalAsset
// );


export default statistic;