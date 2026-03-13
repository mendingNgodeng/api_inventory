import { Context } from "hono";
import { assetRentalService } from "../services/assetRental.services";
import {
  CreateAssetRentalSchema,
  UpdateAssetRentalSchema,
  FinishRentalSchema,
  payRental
} from "../validation/assetRental.validation";

export class assetRentalController {
  static async getAll(c: Context) {
    try {
      const data = await assetRentalService.getAll();
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

  static async get(c: Context) {
    try {
      const { id } = c.req.param();
      const numericId = Number(id);

      if (isNaN(numericId)) {
        return c.json({ success: false, message: "ID tidak valid" }, 400);
      }

      const data = await assetRentalService.getById(numericId);

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

  static async create(c: Context) {
    try {
      const body = await c.req.json();
      const result = CreateAssetRentalSchema.safeParse(body);

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

      const data = await assetRentalService.createRental(result.data as any);

      return c.json(
        {
          success: true,
          message: "Rental berhasil dibuat",
          data,
        },
        201
      );
    } catch (error) {
      // business logic error
      if (error instanceof Error) {
        return c.json({ success: false, message: error.message }, 400);
      }

      return c.json({ success: false, message: "Internal server error" }, 500);
    }
  }

  /**
   * FINISH RENTAL:
   * PUT /asset-rentals/:id/finish
   * body: { image_after_rental?: string }  // base64 optional
   */
  static async finish(c: Context) {
    try {
      const { id } = c.req.param();
      const numericId = Number(id);

      if (isNaN(numericId)) {
        return c.json({ success: false, message: "ID tidak valid" }, 400);
      }

      // body optional (boleh kosong)
      const body = await c.req.json().catch(() => ({}));
      const result = FinishRentalSchema.safeParse(body);

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

      const data = await assetRentalService.finishRental(numericId, result.data as any);

      return c.json({
        success: true,
        message: "Rental berhasil diselesaikan",
        data,
      });
    } catch (error) {
      if (error instanceof Error) {
        return c.json({ success: false, message: error.message }, 400);
      }
      return c.json({ success: false, message: "Internal server error" }, 500);
    }
  }


    static async payRental(c: Context) {
    try {
      const { id } = c.req.param();
      const numericId = Number(id);

      if (isNaN(numericId)) {
        return c.json({ success: false, message: "ID tidak valid" }, 400);
      }

      // body optional (boleh kosong)
      const body = await c.req.json().catch(() => ({}));
      const result = payRental.safeParse(body);

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

      const data = await assetRentalService.payRental(numericId, result.data as any);

      return c.json({
        success: true,
        message: "Rental berhasil diselesaikan",
        data,
      });
    } catch (error) {
      if (error instanceof Error) {
        return c.json({ success: false, message: error.message }, 400);
      }
      return c.json({ success: false, message: "Internal server error" }, 500);
    }
  }
  /**
   * CANCEL RENTAL:
   * PUT /asset-rentals/:id/cancel
   */
  static async cancel(c: Context) {
    try {
      const { id } = c.req.param();
      const numericId = Number(id);

      if (isNaN(numericId)) {
        return c.json({ success: false, message: "ID tidak valid" }, 400);
      }

      const data = await assetRentalService.cancelRental(numericId);

      return c.json({
        success: true,
        message: "Rental berhasil dibatalkan",
        data,
      });
    } catch (error) {
      if (error instanceof Error) {
        return c.json({ success: false, message: error.message }, 400);
      }
      return c.json({ success: false, message: "Internal server error" }, 500);
    }
  }
  //  static async delete(c: Context) {
  //     try {
  //       const { id } = c.req.param();
  //     const numericId = Number(id);
  
  //     if (isNaN(numericId)) {
  //       return c.json({
  //         success: false,
  //         message: 'ID tidak valid'
  //       }, 400);
  //     }
  //       await assetRentalService.delete(numericId);
  
  //       return c.json({
  //         success: true,
  //         message: 'Data berhasil dihapus'
  //       });
  
  //     } catch (error) {
  //       return c.json({
  //         success: false,
  //         message: error instanceof Error ? error.message : 'Internal server error'
  //       }, 400);
  //     }
  //   }

    //   static async deleteAllNonActive(c: Context) {
    //   try {
    //     const { id } = c.req.param();
    //   const numericId = Number(id);
  
    //   if (isNaN(numericId)) {
    //     return c.json({
    //       success: false,
    //       message: 'ID tidak valid'
    //     }, 400);
    //   }
    //     await assetRentalService.deleteAllNonActive();
  
    //     return c.json({
    //       success: true,
    //       message: 'Data berhasil dihapus'
    //     });
  
    //   } catch (error) {
    //     return c.json({
    //       success: false,
    //       message: error instanceof Error ? error.message : 'Internal server error'
    //     }, 400);
    //   }
    // }
}

