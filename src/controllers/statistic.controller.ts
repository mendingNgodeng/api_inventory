import { Context } from 'hono';
import { StatisticService } from '../services/statistic.services';

export class statisticController {

  static async getDashboardSummary(c: Context) {
     try {
      const data = await StatisticService.getDashboardSummary();

      return c.json({
        success: true,
        data: data
      });

    } catch (error) {
      return c.json({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error'
      }, 500);
    }
  }
  static async getCategoryRankingByStock(c: Context) {
    try {
      const data = await StatisticService.getCategoryRankingByStock();

      return c.json({
        success: true,
        data: data
      });

    } catch (error) {
      return c.json({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error'
      }, 500);
    }
  }

    static async get5LatestLogs(c: Context) {
    try {
      const data = await StatisticService.get5LatestLogs();
      return c.json({
        success: true,
        data: data
      });

    } catch (error) {
      return c.json({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error'
      }, 500);
    }
  }
// not used all below

   static async totalAsset(c: Context) {
    try {
      const data = await StatisticService.totalAsset();

      return c.json({
        success: true,
        data: data
      });

    } catch (error) {
      return c.json({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error'
      }, 500);
    }
  }

     static async totalAssetKinds(c: Context) {
    try {
      const data = await StatisticService.totalAssetKinds();

      return c.json({
        success: true,
        data: data
      });

    } catch (error) {
      return c.json({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error'
      }, 500);
    }
  }

  // actually karyawan
      static async totalUser(c: Context) {
    try {
      const data = await StatisticService.totalUser();

      return c.json({
        success: true,
        data: data
      });

    } catch (error) {
      return c.json({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error'
      }, 500);
    }
  }

   static async totalUsedAsset(c: Context) {
    try {
      const data = await StatisticService.totalUsedAsset();

      return c.json({
        success: true,
        data: data
      });

    } catch (error) {
      return c.json({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error'
      }, 500);
    }
  }

}
