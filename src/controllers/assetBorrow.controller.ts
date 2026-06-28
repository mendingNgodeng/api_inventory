// admin control

import { Context } from 'hono';
import { AssetBorrowService } from '../services/assetBorrow.services';
import { borrowSchema,UsedSchema,rejectBorrowSchema,borrowRequestSchema,returnBorrowSchema} from '../validation/assetBorrow.validation';

export class assetBorrowController {

  static async getAll(c: Context) {
    try {
      const data = await AssetBorrowService.getAll();

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

  
static async createUsed(c: Context) {
  try {
    const id_user = c.get("userId")
    const body = await c.req.json();
    const result = UsedSchema.safeParse(body);

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
      "DIPAKAI","DIPAKAI"
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

     let body = {};

    try {
      body = await c.req.json();
    } catch {
      body = {};
    }

    

    const result = returnBorrowSchema.safeParse(body);

     if (!result.success) {
      return c.json(
        {
          success: false,
          message: "Validasi gagal",
          errors: result.error.flatten().fieldErrors,
        },
        400
      );
    }

    const data = await AssetBorrowService.returnAsset(numericId,result.data);

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

  //  peminjaman baru request dulu, bukan langsung DIPINJAM i guess
  static async requestBorrow(c: Context) {
    try {
      const id_user = c.get("userId");
      const body = await c.req.json();

      const result = borrowRequestSchema.safeParse(body);

      if (!result.success) {
        return c.json(
          {
            success: false,
            message: "Validasi gagal",
            errors: result.error.flatten().fieldErrors,
          },
          400
        );
      }

      const data = await AssetBorrowService.requestBorrow(id_user, result.data);

      return c.json(
        {
          success: true,
          message: "Request peminjaman berhasil dibuat",
          data,
        },
        201
      );
    } catch (error) {
      return c.json(
        {
          success: false,
          message: error instanceof Error ? error.message : "Internal server error",
        },
        400
      );
    }
  }

  static async approveByAdmin(c: Context) {
    try {
      const actorId = c.get("userId");
      const { id } = c.req.param();
      const numericId = Number(id);

      if (Number.isNaN(numericId)) {
        return c.json(
          {
            success: false,
            message: "ID tidak valid",
          },
          400
        );
      }

      const data = await AssetBorrowService.approveByAdmin(actorId, numericId);

      return c.json({
        success: true,
        message: "Peminjaman berhasil disetujui admin dan menunggu approval bos",
        data,
      });
    } catch (error) {
      return c.json(
        {
          success: false,
          message: error instanceof Error ? error.message : "Internal server error",
        },
        400
      );
    }
  }

  static async approveByBoss(c: Context) {
    try {
      const actorId = c.get("userId");
      const { id } = c.req.param();
      const numericId = Number(id);

      if (Number.isNaN(numericId)) {
        return c.json(
          {
            success: false,
            message: "ID tidak valid",
          },
          400
        );
      }

      const data = await AssetBorrowService.approveByBoss(actorId, numericId);

      return c.json({
        success: true,
        message: "Peminjaman berhasil disetujui bos",
        data,
      });
    } catch (error) {
      return c.json(
        {
          success: false,
          message: error instanceof Error ? error.message : "Internal server error",
        },
        400
      );
    }
  }

  static async rejectBorrow(c: Context) {
    try {
      const actorId = c.get("userId");
      const { id } = c.req.param();
      const numericId = Number(id);

      if (Number.isNaN(numericId)) {
        return c.json(
          {
            success: false,
            message: "ID tidak valid",
          },
          400
        );
      }

      let body = {};

      try {
        body = await c.req.json();
      } catch {
        body = {};
      }

      const result = rejectBorrowSchema.safeParse(body);

      if (!result.success) {
        return c.json(
          {
            success: false,
            message: "Validasi gagal",
            errors: result.error.flatten().fieldErrors,
          },
          400
        );
      }

      const data = await AssetBorrowService.rejectBorrow(
        actorId,
        numericId,
        result.data
      );

      return c.json({
        success: true,
        message: "Peminjaman berhasil ditolak",
        data,
      });
    } catch (error) {
      return c.json(
        {
          success: false,
          message: error instanceof Error ? error.message : "Internal server error",
        },
        400
      );
    }
  }


}
