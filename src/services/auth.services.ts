import { prisma } from '../utils/prisma';
import bcrypt from 'bcryptjs';
import { generateToken,verifyToken } from '../utils/jwt';
import { createAssetLog,buildLogDescription} from '../utils/asset-logs';

export class AuthService {
  static async register(data: {
    username: string;
    name: string;
    password: string;
  }) {
          return prisma.$transaction(async(tx) => {
            const {password} = data;
             const hashed = await bcrypt.hash(password, 10);
        const created = await tx.user.create(
          {data:{...data,password:hashed, role:"ADMIN"}}
        )
  
        await createAssetLog(tx,{
          action:"USER(KARYAWAN)_CREATE",
          description:buildLogDescription({
            title:"user(karyawan) dibuat",
          detail: `user(karyawan) ${created.name} (${created.jabatan ?? null} - ${created.no_hp ?? null}) dengan role ${created.role} berhasil dibuat`,
            meta: {
              id_user: created.id_user,
              name: created.name,
              role:created.role,
              no_hp: created.no_hp ?? null,
              jabatan: created.jabatan ?? null,
            },
          }),
        });
        return created;
      });
    }
  // {
  //   const { username,name, password } = data;

  //   // cek unique username and email
  //   const exist_username = await prisma.user.findUnique({
  //     where: { username },
  //   });

  //   if (exist_username) throw new Error('username sudah dipakai');

  //   // hash password
  //   const hashed = await bcrypt.hash(password, 10);

  //   const user = await prisma.user.create({
  //     data: {
  //       username,
  //       name,
  //       password: hashed,
  //       role: 'ADMIN',
  //     },
  //   });
  //   return user;
  // }
    
  static async login(data: {
    identifier: string; // username 
    password: string;
    
  }) {
    const { identifier, password } = data;

    // cari user by username ATAU email // gak jade
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username: identifier },{name:identifier}], //in case something added
      },
    });

    if (!user) throw new Error('user tidak ditemukan ' + identifier);

    // cek password
    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new Error('Password salah');

    // token
    const token = await generateToken(
      {
        id: user.id_user,
        username: user.username,
        name: user.name,
        role:user.role
      },
      Number(process.env.TokenExpired) // expired in 1 hour
    );
    // console.log("TOKEN:", token);

// console.log("TEST VERIFY:", await verifyToken(token));
const { password: _, ...safeUser } = user;
return { user: safeUser, token };
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
