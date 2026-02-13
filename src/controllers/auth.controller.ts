import { Context } from 'hono';
import { AuthService } from '../services/auth.services';
import { urlSchema } from '../validation/auth.validation';


export class AuthController {
  static async register(c: Context) {
    try {
      const body = await c.req.json();
      const parsed = urlSchema.safeParse(body);
      if (!parsed.success) {
        return c.json(
          {
            status: 'error',
            errors: parsed.error?.flatten().fieldErrors,
          },
          400
        );
      }
      const user = await AuthService.register(body);
      return c.json({ message: 'Register berhasil', user }, 201);
    } catch (err: any) {
      return c.json({ error: err.message }, 400);
    }
  }

  static async login(c: Context) {
    try {
      const body = await c.req.json();
      const result = await AuthService.login(body);
      return c.json({ message: 'Login berhasil', ...result });
      
    } catch (err: any) {
      return c.json({ error: err.message }, 400);
    }
  }

static async logout(c: Context) {
  const auth = c.req.header('Authorization');

  if (!auth) return c.json({ error: 'Token tidak ada' }, 401);

  const token = auth.replace(/^Bearer\s+/i, '').trim();
  await AuthService.logout(token);
  
  return c.json({ message: 'Logout berhasil' });
}

}