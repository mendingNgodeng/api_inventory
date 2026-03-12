import { Context } from 'hono';
import { userService } from '../services/user.services';
import { Schema,UpdateSchema,ManySchema } from '../validation/user.validation';


export class userController {

  static async getAll(c: Context) {
    try {
      const id_user = c.get("userId")
      // console.log(Number(id_user))
      // console.log(c.get("userId"))

      const data = await userService.getAll(id_user);

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

  static async getById(c: Context) {
    try {
      const { id } = c.req.param();
      const id_user = c.get("userId")


      const id_data = id ?? id_user

      const numericId = Number(id_data);

    if (isNaN(numericId)) {
      return c.json({
        success: false,
        message: 'ID tidak valid'
      }, 400);
    }
      const data = await userService.getById(numericId);

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
      const id_user = c.get("userId")

      const body = await c.req.json();
      const result = Schema.safeParse(body);

      if (!result.success) {
        return c.json({
          success: false,
          message: 'Validasi gagal',
          errors: result.error.flatten().fieldErrors
        }, 400);
      }

      const data = await userService.create(id_user,result.data);

      return c.json({
        success: true,
        message: 'Users berhasil dibuat',
        data
      }, 201);

    } catch (error) {
      return c.json({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error'
      }, 500);
    }
  }

  static async createMany(c: Context) {
    try {
      const id_user = c.get("userId")
      const body = await c.req.json();
      const result = ManySchema.safeParse(body);

      if (!result.success) {
        return c.json({
          success: false,
          message: 'Validasi gagal',
          errors: result.error.flatten().fieldErrors
        }, 400);
      }

      const data = await userService.createMany(id_user,result.data);

      return c.json({
        success: true,
        message: 'USers berhasil dibuat',
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
      const id_user = c.get("userId")

        const { id } = c.req.param();
        const numericId = Number(id);
  
        if (isNaN(numericId)) {
          return c.json({ success: false, message: 'ID tidak valid' }, 400);
        }
  
        const body = await c.req.json();
        const result = UpdateSchema.safeParse(body);
  
        if (!result.success) {
          return c.json({
            success: false,
            message: 'Validasi gagal',
            errors: result.error.flatten().fieldErrors
          }, 400);
        }
  
        const data = await userService.update(id_user,numericId, result.data);
  
        return c.json({
          success: true,
          message: 'Users berhasil diupdate',
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
      const id_user = c.get("userId")

      const { id } = c.req.param();
    const numericId = Number(id);

    if (isNaN(numericId)) {
      return c.json({
        success: false,
        message: 'ID tidak valid'
      }, 400);
    }
      await userService.delete(id_user,numericId);

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
