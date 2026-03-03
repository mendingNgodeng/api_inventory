import type { Context } from "hono";
import { assetLogsService } from "../services/assetLogs.services"; // sesuaikan path

function parsePagination(c: Context) {
  const takeQ = c.req.query("take");
  const skipQ = c.req.query("skip");

  const take = takeQ ? Number(takeQ) : undefined;
  const skip = skipQ ? Number(skipQ) : undefined;

  const safeTake =
    take !== undefined && Number.isFinite(take) && take > 0 ? take : undefined;
  const safeSkip =
    skip !== undefined && Number.isFinite(skip) && skip >= 0 ? skip : undefined;

  return { take: safeTake, skip: safeSkip };
}

export class assetLogsController {
  static async getAll(c: Context) {
    try {
      const paging = parsePagination(c);
      const data = await assetLogsService.getAll(paging);

      return c.json({
        success: true,
        data,
      });
    } catch (error) {
      return c.json(
        {
          success: false,
          message: error instanceof Error ? error.message : "Internal server error",
        },
        500
      );
    }
  }

  static async get(c: Context) {
    try {
      const { id } = c.req.param();
      const numericId = Number(id);

      if (isNaN(numericId)) {
        return c.json({ success: false, message: "ID tidak valid" }, 400);
      }

      const data = await assetLogsService.getById(numericId);

      if (!data) {
        return c.json({ success: false, message: "Data tidak ditemukan" }, 404);
      }

      return c.json({ success: true, data });
    } catch (error) {
      return c.json(
        {
          success: false,
          message: error instanceof Error ? error.message : "Internal server error",
        },
        500
      );
    }
  }

  // =========================
  // FILTER PER GROUP
  // =========================

  static async getLocation(c: Context) {
    try {
      const paging = parsePagination(c);
      const data = await assetLogsService.getLocation(paging);
      return c.json({ success: true, data });
    } catch (error) {
      return c.json(
        { success: false, message: error instanceof Error ? error.message : "Internal server error" },
        500
      );
    }
  }

  static async getRentalCustomer(c: Context) {
    try {
      const paging = parsePagination(c);
      const data = await assetLogsService.getRentalCustomer(paging);
      return c.json({ success: true, data });
    } catch (error) {
      return c.json(
        { success: false, message: error instanceof Error ? error.message : "Internal server error" },
        500
      );
    }
  }

  static async getUser(c: Context) {
    try {
      const paging = parsePagination(c);
      const data = await assetLogsService.getUser(paging);
      return c.json({ success: true, data });
    } catch (error) {
      return c.json(
        { success: false, message: error instanceof Error ? error.message : "Internal server error" },
        500
      );
    }
  }

  static async getAsset(c: Context) {
    try {
      const paging = parsePagination(c);
      const data = await assetLogsService.getAsset(paging);
      return c.json({ success: true, data });
    } catch (error) {
      return c.json(
        { success: false, message: error instanceof Error ? error.message : "Internal server error" },
        500
      );
    }
  }

  static async getAssetStock(c: Context) {
    try {
      const paging = parsePagination(c);
      const data = await assetLogsService.getAssetStock(paging);
      return c.json({ success: true, data });
    } catch (error) {
      return c.json(
        { success: false, message: error instanceof Error ? error.message : "Internal server error" },
        500
      );
    }
  }

  static async getTypes(c: Context) {
    try {
      const paging = parsePagination(c);
      const data = await assetLogsService.getTypes(paging);
      return c.json({ success: true, data });
    } catch (error) {
      return c.json(
        { success: false, message: error instanceof Error ? error.message : "Internal server error" },
        500
      );
    }
  }

  static async getCategories(c: Context) {
    try {
      const paging = parsePagination(c);
      const data = await assetLogsService.getCategories(paging);
      return c.json({ success: true, data });
    } catch (error) {
      return c.json(
        { success: false, message: error instanceof Error ? error.message : "Internal server error" },
        500
      );
    }
  }

  static async getRental(c: Context) {
    try {
      const paging = parsePagination(c);
      const data = await assetLogsService.getRental(paging);
      return c.json({ success: true, data });
    } catch (error) {
      return c.json(
        { success: false, message: error instanceof Error ? error.message : "Internal server error" },
        500
      );
    }
  }

  static async getBorrow(c: Context) {
    try {
      const paging = parsePagination(c);
      const data = await assetLogsService.getBorrow(paging);
      return c.json({ success: true, data });
    } catch (error) {
      return c.json(
        { success: false, message: error instanceof Error ? error.message : "Internal server error" },
        500
      );
    }
  }

  static async getMaintenance(c: Context) {
    try {
      const paging = parsePagination(c);
      const data = await assetLogsService.getMaintenance(paging);
      return c.json({ success: true, data });
    } catch (error) {
      return c.json(
        { success: false, message: error instanceof Error ? error.message : "Internal server error" },
        500
      );
    }
  }

  // opsional kalau kamu pakai
  static async getDeleteHistory(c: Context) {
    try {
      const paging = parsePagination(c);
      const data = await assetLogsService.getDeleteHistory(paging);
      return c.json({ success: true, data });
    } catch (error) {
      return c.json(
        { success: false, message: error instanceof Error ? error.message : "Internal server error" },
        500
      );
    }
  }

  static async getOther(c: Context) {
    try {
      const paging = parsePagination(c);
      const data = await assetLogsService.getOther(paging);
      return c.json({ success: true, data });
    } catch (error) {
      return c.json(
        { success: false, message: error instanceof Error ? error.message : "Internal server error" },
        500
      );
    }
  }
}