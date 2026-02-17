import { Context } from 'hono';
import { assetStockService } from '../services/assetStock.services';
import { Schema } from '../validation/assetStock.validation';

export class assetStockController {

  static async getAll(c: Context) {
    try {
      const data = await assetStockService.getAll();

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
      const data = await assetStockService.getById(numericId);

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

  static async create(c: Context) {
    try {
      const body = await c.req.json();
      const result = await Schema.safeParseAsync(body);

      if (!result.success) {
        return c.json({
          success: false,
          message: 'Validasi gagal',
          errors: result.error.flatten().fieldErrors
        }, 400);
      }

      const data = await assetStockService.create(result.data);

      return c.json({
        success: true,
        message: 'Data berhasil dibuat',
        data
      }, 201);

    } catch (error) {
      return c.json({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error'
      }, 500);
    }
  }

  static async update(c: Context) {
      try {
        const { id } = c.req.param();
        const numericId = Number(id);
  
        if (isNaN(numericId)) {
          return c.json({ success: false, message: 'ID tidak valid' }, 400);
        }
  
        const body = await c.req.json();
        const result = await Schema.safeParseAsync(body);


        if (!result.success) {
          return c.json({
            success: false,
            message: 'Validasi gagal',
            errors: result.error.flatten().fieldErrors
          }, 400);
        }
  
        const data = await assetStockService.update(numericId, result.data);
  
        return c.json({
          success: true,
          message: 'Asset category berhasil diupdate',
          data
        });
  
      } catch (error) {
        return c.json({
          success: false,
          message: error instanceof Error ? error.message : 'Internal server error'
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
      await assetStockService.delete(numericId);

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
