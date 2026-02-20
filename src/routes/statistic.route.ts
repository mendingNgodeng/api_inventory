import { Hono } from 'hono';
import { statisticController } from '../controllers/statistic.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const statistic = new Hono();

statistic.get(
  '/rankCtgByStock',
  statisticController.getCategoryRankingByStock
);

statistic.get(
  '/getDashboardSummary',
  statisticController.getDashboardSummary
);



statistic.get(
  '/totalUser',
  statisticController.totalUser
);

statistic.get(
  '/totalAssetKinds',
  statisticController.totalAssetKinds
);

statistic.get(
  '/totalUsedAsset',
  statisticController.totalUsedAsset
);


statistic.get(
  '/totalAsset',
  statisticController.totalAsset
);


export default statistic;