//  require role = cek role
//  authmiddleware = cek token
//  requireselOrAdmin = cek self and admin

import { Context, Next } from 'hono';
import { verifyToken } from '../utils/jwt';
import { prisma } from '../utils/prisma';

export const authMiddleware = async (c: Context, next: Next) => {
  const auth = c.req.header('Authorization');

  if (!auth) return c.json({ error: 'Token tidak ada' }, 401);

  // const token = auth.replace('Bearer ', '');
  const token = auth.replace(/^Bearer\s+/i, '').trim();
  try {
    const blacklisted = await prisma.tokenBlacklisted.findUnique({
      where: { token },
    });

    if (blacklisted) {
      return c.json({ error: 'Token sudah logout' }, 401);
    }

    const decoded = await verifyToken(token);

    c.set('user', decoded);
    c.set('userId', decoded.id);

    await next();
  } catch (err) {
    return c.json({ error: 'Token invalid' }, 401);
  }
};

export const requireRole = (role: string) => {
  return async (c: Context, next: Next) => {
    const user = c.get('user');

    if (!user || user.role !== role) {
      return c.json({ error: 'Tidak punya akses' }, 403);
    }

    await next();
  };
};

// not used
// ownership
export const requireSelfOrAdmin = async (c: Context, next: Next) => {
  const user = c.get('user');
  const targetId = c.req.param('id');

  // admin = lolos
  if (user.role === 'admin') return next();

  // user biasa = hanya boleh akses dirinya
  if (user.id !== targetId) {
    return c.json({ error: 'Tidak boleh akses user lain' }, 403);
  }

  await next();
};