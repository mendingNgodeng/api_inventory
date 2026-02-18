import { Context } from 'hono';
import { assetMaintenanceService } from '../services/assetMaintenance.services';
import { Schema} from '../validation/assetMaintenance.validation';

export class assetMaintenaceController {

  static async getAll(c: Context) {
    try {
      const data = await assetMaintenanceService.getAll();

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

  
static async createMaintenance(c: Context) {
  try {
    const body = await c.req.json();
    const result = Schema.safeParse(body);

    if (!result.success) {
      return c.json({
        success: false,
        message: "Validasi gagal",
        errors: result.error.flatten().fieldErrors
      }, 400);
    }

    const data = await assetMaintenanceService.createMaintenance(
      result.data
    );

    return c.json({
      success: true,
      message: "Asset berhasil dipakai",
      data
    }, 201);

  } catch (error) {
    return c.json({
      success: false,
      message: error instanceof Error ? error.message : "Internal server error"
    }, 500);
  }
}


  static async get(c: Context) {
    try {
      const { id } = c.req.param();

      const numericId = Number(id);

    if (isNaN(numericId)) {
      return c.json({
        success: false,
        message: 'ID tidak valid'
      }, 400);
    }
      const data = await assetMaintenanceService.getById(numericId);

      if (!data) {
        return c.json({
          success: false,
          message: 'Data tidak ditemukan'
        }, 404);
      }

      return c.json({
        success: true,
        data
      });

    } catch (error) {
      return c.json({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error'
      }, 500);
    }
  }

static async returnAsset(c: Context) {
  try {
    const { id } = c.req.param();
    const numericId = Number(id);

    if (isNaN(numericId)) {
      return c.json({
        success: false,
        message: "ID tidak valid"
      }, 400);
    }

    const data = await assetMaintenanceService.fixedAsset(numericId);

    return c.json({
      success: true,
      message: "Asset berhasil dikembalikan",
      data
    });

  } catch (error) {

    // Error dari business logic (misalnya sudah dikembalikan)
    if (error instanceof Error) {
      return c.json({
        success: false,
        message: error.message
      }, 400);
    }

    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
}


  static async delete(c: Context) {
    try {
      const { id } = c.req.param();
    const numericId = Number(id);

    if (isNaN(numericId)) {
      return c.json({
        success: false,
        message: 'ID tidak valid'
      }, 400);
    }
      await assetMaintenanceService.delete(numericId);

      return c.json({
        success: true,
        message: 'Data berhasil dihapus'
      });

    } catch (error) {
      return c.json({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error'
      }, 500);
    }
  }
}
