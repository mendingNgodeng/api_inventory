import { prisma } from '../utils/prisma';
import { createAssetLog,buildLogDescription} from '../utils/asset-logs';
import bcrypt from 'bcryptjs';

// import { userRole } from '@prisma/client';

export class userService {

  static async getAll(id:number) {
    return prisma.user.findMany({
      where: {
        NOT:{
          id_user:id
        }
      }
    });
  }

  // will be used for profile
  static async getById(id: number) {
    return prisma.user.findUnique({
      where: { id_user:id }
    });
  }

  static async create(input: {
    name: string;
    username:string;
    // role:userRole;
    password:string;
    jabatan?: string;
    no_hp?: string;

  }) {
        return prisma.$transaction(async(tx) => {
          const {password} = input;
           const hashed = await bcrypt.hash(password, 10);
      const created = await tx.user.create(
        {data:{...input,password:hashed, role:"KARYAWAN"}}
      )

      await createAssetLog(tx,{
        action:"USER(KARYAWAN)_CREATE",
        description:buildLogDescription({
          title:"user(karyawan) dibuat",
        detail: `user(karyawan) ${created.name} (${created.jabatan ?? null} - ${created.no_hp ?? null}) berhasil dibuat`,
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
    // return prisma.user.create({
    //   data: input
    // });
  }

  static async update(id: number, input: {
    name: string;
    jabatan?: string;
    no_hp?: string;
    password:string;
    username:string;

  }) {
     return prisma.$transaction(async (tx) => {
      // ambil data lama (opsional but why not?)

      const before = await tx.user.findUnique({
        where: { id_user: id },
      });
      if (!before) throw new Error("user tidak ditemukan");

 const dataToUpdate: {
      name: string;
      jabatan?: string;
      no_hp?: string;
      username: string;
      password?: string;
    } = {
      name: input.name,
      jabatan: input.jabatan,
      no_hp: input.no_hp,
      username: input.username,
    };

    if (input.password !== before.password) {
      dataToUpdate.password = await bcrypt.hash(input.password, 10);
    } else {
      dataToUpdate.password = before.password;
    }

    const updated = await tx.user.update({
      where: { id_user: id },
      data: dataToUpdate,
    });

      await createAssetLog(tx, {
        action: "USER(KARYAWAN)_UPDATE",
        description: buildLogDescription({
          title: "user(karyawan) diupdate",
          detail: `user(karyawan) ${before.name} (${before.jabatan ?? null} - ${before.no_hp ?? null}) diupdate ${updated.name} (${updated.jabatan ?? null} - ${updated.no_hp ?? null}) `,
          meta: {
            id_user: id,
            before: {
              name: before.name,
              no_hp: before.no_hp ?? null,
              jabatan: before.jabatan ?? null,
            },
            after: {
              name: updated.name,
              no_hp: updated.no_hp ?? null,
              jabatan: updated.jabatan ?? null,
            },
          },
        }),
      });

      return updated;
    });

  }

  static async delete(id: number) {
      return prisma.$transaction(async (tx) => {
      // ambil dulu buat log (karena setelah delete datanya hilang)
      const before = await tx.user.findUnique({
        where: { id_user: id },
      });
      if (!before) throw new Error("user tidak ditemukan");

      const deleted = await tx.user.delete({
        where: { id_user: id },
      });

      await createAssetLog(tx, {
        action: "USER(KARYAWAN)_DELETE",
        description: buildLogDescription({
          title: "User(karyawan) dihapus",
          detail: `User(karyawan) "${before.name}" dihapus`,
          meta: {
            id_user: before.id_user,
            name: before.name,
            no_hp: before.no_hp ?? null,
            jabatan: before.jabatan ?? null
          },
        }),
      });

      return deleted;
    });
    // return prisma.user.delete({
    //   where: { id_user: id }
    // });
  }
}
