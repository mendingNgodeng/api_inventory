import { prisma } from '../utils/prisma';
import bcrypt from 'bcryptjs';
import { Context } from 'hono';
import { generateToken,verifyToken } from '../utils/jwt';

export class AuthService {
  static async register(data: {
    username: string;
    password: string;
  }) {
    const { username, password } = data;

    // cek unique username and email
    const exist_username = await prisma.admin.findUnique({
      where: { username },
    });

    if (exist_username) throw new Error('username sudah dipakai');

    // hash password
    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.admin.create({
      data: {
        username,
        // email,
        password: hashed,
        role: 'ADMIN',
      },
    });
    return user;
  }

  static async login(data: {
    identifier: string; // username 
    password: string;
    
  }) {
    const { identifier, password } = data;

    // cari user by username ATAU email // gak jade
    const admin = await prisma.admin.findFirst({
      where: {
        OR: [{ username: identifier }], //in case something added
      },
    });

    if (!admin) throw new Error('admin tidak ditemukan ' + identifier);

    // cek password
    const match = await bcrypt.compare(password, admin.password);
    if (!match) throw new Error('Password salah');

    // token
    const token = await generateToken(
      {
        id: admin.id_admin,
        username: admin.username,
      },
      Number(process.env.TokenExpired) // expired in 1 hour
    );
    // console.log("TOKEN:", token);

// console.log("TEST VERIFY:", await verifyToken(token));

    return { admin, token };
  }
  static async logout(token: string) {
  const decoded: any = await verifyToken(token);

  await prisma.blacklistedToken.create({
    data: {
      token,
      expiredAt: new Date(decoded.exp * 1000),
    },
  });

  return true;
}

}
