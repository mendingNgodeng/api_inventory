// admin control

import { Context } from 'hono';
import { AssetBorrowService } from '../services/assetBorrow.services';
import { borrowSchema,UsedSchema} from '../validation/assetBorrow.validation';

export class assetBorrowKaryawanController {

  static async getAll(c: Context) {
    try {
      const id_user = c.get("userId")
      const data = await AssetBorrowService.getAllById(id_user);

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

static async createBorrow(c: Context) {
  try {
    const id_user = c.get("userId")
    const body = await c.req.json();
    const result = borrowSchema.safeParse(body);

    if (!result.success) {
      return c.json({
        success: false,
        message: "Validasi gagal",
        errors: result.error.flatten().fieldErrors
      }, 400);
    }

    const data = await AssetBorrowService.createBorrow(
      id_user,
      result.data,
      "DIPINJAM","DIPINJAM"
    );

    return c.json({
      success: true,
      message: "Asset berhasil dipinjam",
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
      const data = await AssetBorrowService.getById(numericId);

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

    const data = await AssetBorrowService.returnAsset(numericId);

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
      await AssetBorrowService.delete(numericId);

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
