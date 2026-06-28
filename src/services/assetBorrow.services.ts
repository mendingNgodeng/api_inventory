import { prisma } from '../utils/prisma';
import { BorrowStatus,AssetStockStatus,userRole } from '@prisma/client';
import {createAssetLog,buildLogDescription} from '../utils/asset-logs'


function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function calculateBorrowLateDays(dueDate: Date, comparedDate = new Date()) {
  const due = startOfDay(dueDate);
  const current = startOfDay(comparedDate);

  if (current <= due) return 0;

  const diffMs = current.getTime() - due.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export class AssetBorrowService {
private static async attachApprovalUsers(rows: any[]) {
  const userIds = Array.from(
    new Set(
      rows
        .flatMap((r) => [
          r.requested_by_id,
          r.admin_approved_by_id,
          r.boss_approved_by_id,
          r.rejected_by_id,
        ])
        .filter(Boolean)
    )
  );

  if (!userIds.length) {
    return rows.map((r) => ({
      ...r,
      requestedBy: null,
      adminApprovedBy: null,
      bossApprovedBy: null,
      rejectedBy: null,
    }));
  }

  const users = await prisma.user.findMany({
    where: {
      id_user: {
        in: userIds,
      },
    },
    select: {
      id_user: true,
      name: true,
      username: true,
      role: true,
      jabatan: true,
      no_hp: true,
    },
  });

  const userMap = new Map(users.map((u) => [u.id_user, u]));

  return rows.map((r) => ({
    ...r,
    requestedBy: r.requested_by_id ? userMap.get(r.requested_by_id) ?? null : null,
    adminApprovedBy: r.admin_approved_by_id
      ? userMap.get(r.admin_approved_by_id) ?? null
      : null,
    bossApprovedBy: r.boss_approved_by_id
      ? userMap.get(r.boss_approved_by_id) ?? null
      : null,
    rejectedBy: r.rejected_by_id ? userMap.get(r.rejected_by_id) ?? null : null,
  }));
}

  static async getAll() {
  const rows = await prisma.assetBorrowed.findMany({
    orderBy:{borrowed_date:'desc'},
    include: {
        user:{
            select:{
        id_user: true,
        name: true,
        jabatan: true,
        no_hp: true,
        role: true,
            }
          },
      assetStock: {
        include: {
          asset:{
            select:{
              asset_code: true,
              asset_name: true
            }
          },
          location: {
            select: {
              name: true
            }
          },
        
        }
      }
    }
  });
  const activeRows = rows.filter((r) =>
  ["DIPINJAM", "TERLAMBAT"].includes(r.status)
);

for (const row of activeRows) {
  await this.refreshBorrowLateStatusById(row.id_asset_borrowed);
}

  return prisma.assetBorrowed.findMany({
  orderBy: { borrowed_date: "desc" },
  include: {
    user: {
      select: {
        id_user: true,
        name: true,
        jabatan: true,
        no_hp: true,
        role: true,
      },
    },
    assetStock: {
      include: {
        asset: {
          select: {
            asset_code: true,
            asset_name: true,
          },
        },
        location: {
          select: {
            name: true,
          },
        },
      },
    },
  },
});
}

static async getAllById(id:number) {
  return prisma.assetBorrowed.findMany({
    orderBy:{borrowed_date:'desc'},
    where:{id_user:id},
    include: {
        user:{
            select:{
              name:true,
              jabatan:true,
              no_hp:true
            }
          },
      assetStock: {
        include: {
          asset:{
            select:{
              asset_code: true,
              asset_name: true
            }
          },
          location: {
            select: {
              name: true
            }
          },
        }
      }
    }
  });
}


  static async getById(id: number) {
    return prisma.assetBorrowed.findUnique({
      where: { id_asset_borrowed:id }
    });
  }

  static async create(input: {
  
    id_user: number;
    id_asset_stock: number;
    quantity:number;
    status:BorrowStatus
  }) {
    return prisma.assetBorrowed.create({
      data: input
    });
  }


  static async createBorrow(
  actor_id:number,
  input: {
    borrower_id?: number;
    id_asset_stock: number;
    quantity: number;
  },
  status_value: BorrowStatus, // "DIPINJAM" | "DIPAKAI"
  status_stock: AssetStockStatus // "DIPINJAM" | "DIPAKAI"
) {
  if (input.quantity <= 0) throw new Error("Quantity harus lebih dari 0");

 const borrowerUserId =
    status_value === "DIPINJAM" ? (input.borrower_id ?? actor_id) : null;

  if (status_value === "DIPINJAM" && !borrowerUserId) {
    throw new Error("Peminjaman harus memiliki user");
  }

  if (status_value === "DIPAKAI" && input.borrower_id) {
    throw new Error("Asset dipakai kantor tidak boleh memiliki user");
  }

  return prisma.$transaction(async (tx) => {
    const stock = await tx.assetStock.findUnique({
      where: { id_asset_stock: input.id_asset_stock },
      include: { asset: true, location: true },
    });

    if (!stock) throw new Error("Stock tidak ditemukan");

    if (stock.condition !== "BAIK" || stock.status !== "TERSEDIA") {
      throw new Error("Stock tidak valid untuk dipinjam/dipakai");
    }

    if (stock.quantity < input.quantity) {
      throw new Error("Stock tidak mencukupi");
    }

    const beforeOriginQty = stock.quantity;
    const remainingQty = stock.quantity - input.quantity;

    // 1) Kurangi stok asal
    const updatedOrigin = await tx.assetStock.update({
      where: { id_asset_stock: stock.id_asset_stock },
      data: { quantity: remainingQty },
      include: { asset: true, location: true },
    });

    // 2) Tambah / merge bucket BAIK + (DIPINJAM/DIPAKAI)
    const bucketStock = await tx.assetStock.findFirst({
      where: {
        id_asset: stock.id_asset,
        id_location: stock.id_location,
        condition: "BAIK",
        status: status_stock,
      },
    });

    let bucketId: number | null = null;
    const beforeBucketQty = bucketStock?.quantity ?? 0;
    let afterBucketQty = beforeBucketQty;

    if (bucketStock) {
      const updBucket = await tx.assetStock.update({
        where: { id_asset_stock: bucketStock.id_asset_stock },
        data: { quantity: bucketStock.quantity + input.quantity },
      });
      bucketId = updBucket.id_asset_stock;
      afterBucketQty = updBucket.quantity;
    } else {
      const createdBucket = await tx.assetStock.create({
        data: {
          id_asset: stock.id_asset,
          id_location: stock.id_location,
          condition: "BAIK",
          status: status_stock,
          quantity: input.quantity,
        },
      });
      bucketId = createdBucket.id_asset_stock;
      afterBucketQty = createdBucket.quantity;
    }

    // 3) Buat record borrow
     const borrow = await tx.assetBorrowed.create({
        data: {
          id_user: borrowerUserId,
          id_asset_stock: stock.id_asset_stock,
          quantity: input.quantity,
          status: status_value,
        },
        include: { user: true },
      });
    


    // action log tergantung status_value
    const action =
      status_value === "DIPINJAM" ? "BORROW_CREATE" : "USED_CREATE";

    // title juga bisa beda biar kebaca enak di history
    const title =
      status_value === "DIPINJAM" ? "Peminjaman dibuat" : "Pemakaian dibuat";
const actor = await tx.user.findUnique({
  where: { id_user: actor_id },
});
    await createAssetLog(tx, {
      action,
      description: buildLogDescription({
        title,
        detail:
          status_value === "DIPINJAM"
           ? `Asset "${stock.asset.asset_name} (${stock.asset.asset_code})" dipinjam untuk "${borrow.user?.name ?? "-"}" qty ${input.quantity} oleh "${actor?.name ?? "-"}"`
    : `Asset "${stock.asset.asset_name} (${stock.asset.asset_code})" dipakai kantor qty ${input.quantity} oleh "${actor?.name ?? "-"}"`,
        meta: {
          id_asset_borrowed: borrow.id_asset_borrowed,
          id_asset_stock_origin: stock.id_asset_stock,
          id_asset_stock_bucket: bucketId,
          status_value,
          status_stock,
          asset_name: stock.asset.asset_name,
          asset_code: stock.asset.asset_code,
          location_name: stock.location.name,
            borrower:
    status_value === "DIPINJAM" && borrow.user
      ? {
          id_user: borrow.user.id_user,
          name: borrow.user.name,
          username: borrow.user.username,
        }
      : null,
  actor: actor
    ? {
        id_user: actor.id_user,
        name: actor.name,
        username: actor.username,
        role: actor.role,
      }
    : null,
        user:
  status_value === "DIPINJAM" && borrow.user
    ? { id_user: borrow.user.id_user, name: borrow.user.name }
    : null,
          moved_qty: input.quantity,
          origin_qty: { from: beforeOriginQty, to: updatedOrigin.quantity },
          bucket_qty: { from: beforeBucketQty, to: afterBucketQty },
        },
      }),
    });

    return borrow;
  });
}

// Pengembalian
static async returnAsset(id: number) {
  return prisma.$transaction(async (tx) => {
    const borrow = await tx.assetBorrowed.findUnique({
      where: { id_asset_borrowed: id },
      include: { user: true },
    });

    if (!borrow) throw new Error("Data tidak ditemukan");
    if (borrow.status === "DIKEMBALIKAN") throw new Error("Asset sudah dikembalikan");

    if (
      borrow.status !== "DIPINJAM" &&
      borrow.status !== "DIPAKAI" &&
      borrow.status !== "TERLAMBAT"
    ) {
      throw new Error("Status peminjaman tidak valid untuk pengembalian");
    }

    // simpan status awal untuk log action
    const prevBorrowStatus = borrow.status;

    const originStock = await tx.assetStock.findUnique({
      where: { id_asset_stock: borrow.id_asset_stock },
      include: { asset: true, location: true },
    });

    if (!originStock) throw new Error("Stock asal tidak ditemukan");

    const bucketStatus: AssetStockStatus =
      prevBorrowStatus === "DIPAKAI" ? "DIPAKAI" : "DIPINJAM"; // TERLAMBAT dianggap DIPINJAM

    const bucketStock = await tx.assetStock.findFirst({
      where: {
        id_asset: originStock.id_asset,
        id_location: originStock.id_location,
        condition: "BAIK",
        status: bucketStatus,
      },
    });

    if (!bucketStock) {
      throw new Error("Stock bucket peminjaman/pemakaian tidak ditemukan");
    }

    if (bucketStock.quantity < borrow.quantity) {
      throw new Error("Quantity pada stock bucket tidak valid");
    }

    const beforeBucketQty = bucketStock.quantity;
    const beforeOriginQty = originStock.quantity;

    // 1) Kurangi bucket stock
    const remainingBucketQty = bucketStock.quantity - borrow.quantity;

    let bucketDeleted = false;
    let bucketAfterQty = remainingBucketQty;

    if (remainingBucketQty > 0) {
      await tx.assetStock.update({
        where: { id_asset_stock: bucketStock.id_asset_stock },
        data: { quantity: remainingBucketQty },
      });
    } else {
      await tx.assetStock.delete({
        where: { id_asset_stock: bucketStock.id_asset_stock },
      });
      bucketDeleted = true;
      bucketAfterQty = 0;
    }

    // 2) Tambah kembali ke origin
    const newOriginQty = originStock.quantity + borrow.quantity;

    const updatedOrigin = await tx.assetStock.update({
      where: { id_asset_stock: originStock.id_asset_stock },
      data: { quantity: newOriginQty, status: "TERSEDIA" },
      include: { asset: true, location: true },
    });

    const lateDays = borrow.due_date
  ? calculateBorrowLateDays(new Date(borrow.due_date), new Date())
  : 0;

    // 3) Update borrow record
    const updatedBorrow = await tx.assetBorrowed.update({
      where: { id_asset_borrowed: id },
      data: { status: "DIKEMBALIKAN", returned_date: new Date(),late_days:lateDays },
      include: { user: true },
    });

    // action log tergantung status awal
    const action =
      prevBorrowStatus === "DIPAKAI" ? "USED_RETURN" : "BORROW_RETURN";

    // title juga beda biar kebaca enak
    const title =
      prevBorrowStatus === "DIPAKAI" ? "Pemakaian selesai" : "Peminjaman dikembalikan";

    await createAssetLog(tx, {
      action,
      description: buildLogDescription({
        title,
        detail:
          prevBorrowStatus === "DIPAKAI"
            ? `Asset "${originStock.asset.asset_name} (${originStock.asset.asset_code})" selesai dipakai kantor qty ${borrow.quantity}`
            : `Asset "${originStock.asset.asset_name} (${originStock.asset.asset_code})" dikembalikan qty ${borrow.quantity}`,
        meta: {
          id_asset_borrowed: updatedBorrow.id_asset_borrowed,
          id_asset_stock_origin: originStock.id_asset_stock,
          id_asset_stock_bucket: bucketStock.id_asset_stock,
          bucket_status: bucketStatus, // DIPINJAM / DIPAKAI
          asset_name: originStock.asset.asset_name,
          asset_code: originStock.asset.asset_code,
          location_name: originStock.location.name,

          // untuk pemakaian kantor, user biasanya null
          user:
            prevBorrowStatus === "DIPINJAM" || prevBorrowStatus === "TERLAMBAT"
              ? updatedBorrow.user
                ? { id_user: updatedBorrow.user.id_user, name: updatedBorrow.user.name }
                : null
              : null,

          returned_qty: borrow.quantity,
          origin_qty: { from: beforeOriginQty, to: updatedOrigin.quantity },
          bucket_qty: {
            from: beforeBucketQty,
            to: bucketAfterQty,
            deleted_row: bucketDeleted,
          },
          borrow_status: { from: prevBorrowStatus, to: updatedBorrow.status },
          returned_date: updatedBorrow.returned_date,
        },
      }),
    });

    return updatedBorrow;
  });
}
// why are you here? for testing purpose of course, i had no idea how to make these borrow feature so this is the first before i my engineering-programming-college-student-brain began to braining.
  static async update(id: number, input: {
  
    id_user: number;
    id_asset_stock: number;
    quantity:number;
    status: BorrowStatus;
  }) {
    return prisma.assetBorrowed.update({
      where: { id_asset_borrowed: id },
      data: {
       ...input
      }
    });
  }

  // this is not used
  static async delete(id: number) {
  const borrow = await prisma.assetBorrowed.findUnique({
    where: { id_asset_borrowed: id }
  });

  if (!borrow) {
    throw new Error("Data tidak ditemukan");
  }

  if (borrow.status === "DIPINJAM" || borrow.status === "DIPAKAI") {
    throw new Error("Tidak bisa menghapus data yang masih dipinjam/dipakai");
  }

  return prisma.assetBorrowed.delete({
    where: { id_asset_borrowed: id }
  });

  
}

private static async getActor(tx: any, actor_id: number) {
  const actor = await tx.user.findUnique({
    where: { id_user: actor_id },
  });

  if (!actor) {
    throw new Error("User login tidak ditemukan");
  }

  return actor;
}

private static async moveStockToBorrowBucket(
  tx: any,
  input: {
    id_asset_stock: number;
    quantity: number;
    status_stock: AssetStockStatus;
  }
) {
  const stock = await tx.assetStock.findUnique({
    where: { id_asset_stock: input.id_asset_stock },
    include: { asset: true, location: true },
  });

  if (!stock) throw new Error("Stock tidak ditemukan");

  if (stock.condition !== "BAIK" || stock.status !== "TERSEDIA") {
    throw new Error("Stock tidak valid untuk dipinjam");
  }

  if (stock.quantity < input.quantity) {
    throw new Error("Stock tidak mencukupi");
  }

  const beforeOriginQty = stock.quantity;
  const remainingQty = stock.quantity - input.quantity;

  const updatedOrigin = await tx.assetStock.update({
    where: { id_asset_stock: stock.id_asset_stock },
    data: { quantity: remainingQty },
    include: { asset: true, location: true },
  });

  const bucketStock = await tx.assetStock.findFirst({
    where: {
      id_asset: stock.id_asset,
      id_location: stock.id_location,
      condition: "BAIK",
      status: input.status_stock,
    },
  });

  const beforeBucketQty = bucketStock?.quantity ?? 0;
  let afterBucketQty = beforeBucketQty;
  let bucketId: number | null = null;

  if (bucketStock) {
    const updatedBucket = await tx.assetStock.update({
      where: { id_asset_stock: bucketStock.id_asset_stock },
      data: {
        quantity: bucketStock.quantity + input.quantity,
      },
    });

    bucketId = updatedBucket.id_asset_stock;
    afterBucketQty = updatedBucket.quantity;
  } else {
    const createdBucket = await tx.assetStock.create({
      data: {
        id_asset: stock.id_asset,
        id_location: stock.id_location,
        condition: "BAIK",
        status: input.status_stock,
        quantity: input.quantity,
      },
    });

    bucketId = createdBucket.id_asset_stock;
    afterBucketQty = createdBucket.quantity;
  }

  return {
    stock,
    updatedOrigin,
    bucketId,
    beforeOriginQty,
    afterOriginQty: updatedOrigin.quantity,
    beforeBucketQty,
    afterBucketQty,
  };
}

private static getInitialBorrowStatus(actorRole: userRole): BorrowStatus {
  if (actorRole === "BOS") {
    return "DIPINJAM";
  }

  if (actorRole === "ADMIN") {
    return "MENUNGGU_BOS";
  }

  return "MENUNGGU_ADMIN";
}
// new borrow request
static async requestBorrow(
  actor_id: number,
  input: {
    borrower_id?: number;
    id_asset_stock: number;
    quantity: number;
    due_date: Date;
  }
) {
  if (input.quantity <= 0) {
    throw new Error("Quantity harus lebih dari 0");
  }

  return prisma.$transaction(async (tx) => {
    const actor = await this.getActor(tx, actor_id);

    const borrowerId = input.borrower_id ?? actor_id;

    if (actor.role === "KARYAWAN" && borrowerId !== actor_id) {
      throw new Error("Karyawan hanya boleh mengajukan peminjaman untuk dirinya sendiri");
    }

    const borrower = await tx.user.findUnique({
      where: { id_user: borrowerId },
    });

    if (!borrower) {
      throw new Error("Peminjam tidak ditemukan");
    }

    const stock = await tx.assetStock.findUnique({
      where: { id_asset_stock: input.id_asset_stock },
      include: { asset: true, location: true },
    });

    if (!stock) throw new Error("Stock tidak ditemukan");

    if (stock.condition !== "BAIK" || stock.status !== "TERSEDIA") {
      throw new Error("Stock tidak valid untuk dipinjam");
    }

    if (stock.quantity < input.quantity) {
      throw new Error("Stock tidak mencukupi");
    }

    const dueDate = new Date(input.due_date);
    const now = new Date();

if (Number.isNaN(dueDate.getTime())) {
  throw new Error("Tanggal batas pengembalian tidak valid");
}

if (dueDate <= now) {
  throw new Error("Tanggal batas pengembalian harus setelah waktu sekarang");
}

    const initialStatus = this.getInitialBorrowStatus(actor.role);

    // BOS pinjam langsung: langsung mutasi stok dan status DIPINJAM
    if (initialStatus === "DIPINJAM") {
      const moved = await this.moveStockToBorrowBucket(tx, {
        id_asset_stock: input.id_asset_stock,
        quantity: input.quantity,
        status_stock: "DIPINJAM",
      });

      const borrow = await tx.assetBorrowed.create({
        data: {
          id_user: borrowerId,
          id_asset_stock: input.id_asset_stock,
          quantity: input.quantity,
          returned_date: "-",
          due_date: dueDate,
          status: "DIPINJAM",
          requested_by_id: actor_id,
          boss_approved_by_id: actor_id,
          boss_approved_at: new Date(),
        },
        include: {
          user: true,
        },
      });

      await createAssetLog(tx, {
        action: "BORROW_CREATE_DIRECT_BOSS",
        description: buildLogDescription({
          title: "Peminjaman langsung oleh bos",
          detail: `Asset "${moved.stock.asset.asset_name} (${moved.stock.asset.asset_code})" dipinjam langsung oleh "${borrower.name}" qty ${input.quantity}`,
          meta: {
            id_asset_borrowed: borrow.id_asset_borrowed,
            borrower: {
              id_user: borrower.id_user,
              name: borrower.name,
              role: borrower.role,
            },
            actor: {
              id_user: actor.id_user,
              name: actor.name,
              role: actor.role,
            },
            asset_name: moved.stock.asset.asset_name,
            asset_code: moved.stock.asset.asset_code,
            location_name: moved.stock.location.name,
            moved_qty: input.quantity,
            origin_qty: {
              from: moved.beforeOriginQty,
              to: moved.afterOriginQty,
            },
            bucket_qty: {
              from: moved.beforeBucketQty,
              to: moved.afterBucketQty,
            },
          },
        }),
      });

      return borrow;
    }

    // KARYAWAN / ADMIN: hanya create request, stok belum berubah
    const borrow = await tx.assetBorrowed.create({
      data: {
        id_user: borrowerId,
        id_asset_stock: input.id_asset_stock,
        quantity: input.quantity,
        due_date: dueDate,
        status: initialStatus,
        requested_by_id: actor_id,
      },
      include: {
        user: true,
      },
    });

    await createAssetLog(tx, {
      action: "BORROW_REQUEST",
      description: buildLogDescription({
        title: "Request peminjaman dibuat",
        detail:
          initialStatus === "MENUNGGU_ADMIN"
            ? `Request peminjaman "${stock.asset.asset_name} (${stock.asset.asset_code})" untuk "${borrower.name}" menunggu approval admin`
            : `Request peminjaman "${stock.asset.asset_name} (${stock.asset.asset_code})" untuk "${borrower.name}" menunggu approval bos`,
        meta: {
          id_asset_borrowed: borrow.id_asset_borrowed,
          status: initialStatus,
          borrower: {
            id_user: borrower.id_user,
            name: borrower.name,
            role: borrower.role,
          },
          actor: {
            id_user: actor.id_user,
            name: actor.name,
            role: actor.role,
          },
          asset_name: stock.asset.asset_name,
          asset_code: stock.asset.asset_code,
          location_name: stock.location.name,
          requested_qty: input.quantity,
        },
      }),
    });

    return borrow;
  });
}

static async approveByAdmin(actor_id: number, id: number) {
  return prisma.$transaction(async (tx) => {
    const actor = await this.getActor(tx, actor_id);

    if (actor.role !== "ADMIN") {
      throw new Error("Hanya admin yang bisa melakukan approval tahap admin");
    }

    const borrow = await tx.assetBorrowed.findUnique({
      where: { id_asset_borrowed: id },
      include: {
        user: true,
        assetStock: {
          include: {
            asset: true,
            location: true,
          },
        },
      },
    });

    if (!borrow) {
      throw new Error("Data peminjaman tidak ditemukan");
    }

    if (borrow.status !== "MENUNGGU_ADMIN") {
      throw new Error("Peminjaman ini tidak sedang menunggu approval admin");
    }

    const updated = await tx.assetBorrowed.update({
      where: { id_asset_borrowed: id },
      data: {
        status: "MENUNGGU_BOS",
        admin_approved_by_id: actor_id,
        admin_approved_at: new Date(),
      },
      include: {
        user: true,
      },
    });

    await createAssetLog(tx, {
      action: "BORROW_APPROVE_ADMIN",
      description: buildLogDescription({
        title: "Peminjaman disetujui admin",
        detail: `Request peminjaman "${borrow.assetStock.asset.asset_name} (${borrow.assetStock.asset.asset_code})" disetujui admin dan menunggu approval bos`,
        meta: {
          id_asset_borrowed: borrow.id_asset_borrowed,
          status: {
            from: borrow.status,
            to: updated.status,
          },
          admin: {
            id_user: actor.id_user,
            name: actor.name,
            role: actor.role,
          },
          borrower: borrow.user
            ? {
                id_user: borrow.user.id_user,
                name: borrow.user.name,
              }
            : null,
          asset_name: borrow.assetStock.asset.asset_name,
          asset_code: borrow.assetStock.asset.asset_code,
          quantity: borrow.quantity,
        },
      }),
    });

    return updated;
  });
}

static async approveByBoss(actor_id: number, id: number) {
  return prisma.$transaction(async (tx) => {
    const actor = await this.getActor(tx, actor_id);

    if (actor.role !== "BOS") {
      throw new Error("Hanya bos yang bisa melakukan approval akhir");
    }

    const borrow = await tx.assetBorrowed.findUnique({
      where: { id_asset_borrowed: id },
      include: {
        user: true,
        assetStock: {
          include: {
            asset: true,
            location: true,
          },
        },
      },
    });

    if (!borrow) {
      throw new Error("Data peminjaman tidak ditemukan");
    }

    if (borrow.status !== "MENUNGGU_BOS") {
      throw new Error("Peminjaman ini tidak sedang menunggu approval bos");
    }

    const moved = await this.moveStockToBorrowBucket(tx, {
      id_asset_stock: borrow.id_asset_stock,
      quantity: borrow.quantity,
      status_stock: "DIPINJAM",
    });

    const updated = await tx.assetBorrowed.update({
      where: { id_asset_borrowed: id },
      data: {
        status: "DIPINJAM",
        boss_approved_by_id: actor_id,
        boss_approved_at: new Date(),
      },
      include: {
        user: true,
      },
    });

    await createAssetLog(tx, {
      action: "BORROW_APPROVE_BOSS",
      description: buildLogDescription({
        title: "Peminjaman disetujui bos",
        detail: `Request peminjaman "${moved.stock.asset.asset_name} (${moved.stock.asset.asset_code})" disetujui bos dan menjadi DIPINJAM`,
        meta: {
          id_asset_borrowed: borrow.id_asset_borrowed,
          status: {
            from: borrow.status,
            to: updated.status,
          },
          boss: {
            id_user: actor.id_user,
            name: actor.name,
            role: actor.role,
          },
          borrower: borrow.user
            ? {
                id_user: borrow.user.id_user,
                name: borrow.user.name,
              }
            : null,
          asset_name: moved.stock.asset.asset_name,
          asset_code: moved.stock.asset.asset_code,
          location_name: moved.stock.location.name,
          moved_qty: borrow.quantity,
          origin_qty: {
            from: moved.beforeOriginQty,
            to: moved.afterOriginQty,
          },
          bucket_qty: {
            from: moved.beforeBucketQty,
            to: moved.afterBucketQty,
          },
        },
      }),
    });

    return updated;
  });
}


static async rejectBorrow(
  actor_id: number,
  id: number,
  input?: {
    approval_note?: string;
  }
) {
  return prisma.$transaction(async (tx) => {
    const actor = await this.getActor(tx, actor_id);

    if (actor.role !== "ADMIN" && actor.role !== "BOS") {
      throw new Error("Hanya admin atau bos yang bisa menolak peminjaman");
    }

    const borrow = await tx.assetBorrowed.findUnique({
      where: { id_asset_borrowed: id },
      include: {
        user: true,
        assetStock: {
          include: {
            asset: true,
            location: true,
          },
        },
      },
    });

    if (!borrow) {
      throw new Error("Data peminjaman tidak ditemukan");
    }

    if (
      borrow.status !== "MENUNGGU_ADMIN" &&
      borrow.status !== "MENUNGGU_BOS"
    ) {
      throw new Error("Peminjaman ini tidak bisa ditolak");
    }

    if (actor.role === "ADMIN" && borrow.status !== "MENUNGGU_ADMIN") {
      throw new Error("Admin hanya bisa menolak request yang menunggu approval admin");
    }

    const updated = await tx.assetBorrowed.update({
      where: { id_asset_borrowed: id },
      data: {
        status: "DITOLAK",
        rejected_by_id: actor_id,
        rejected_at: new Date(),
        approval_note: input?.approval_note ?? null,
      },
      include: {
        user: true,
      },
    });

    await createAssetLog(tx, {
      action: "BORROW_REJECT",
      description: buildLogDescription({
        title: "Peminjaman ditolak",
        detail: `Request peminjaman "${borrow.assetStock.asset.asset_name} (${borrow.assetStock.asset.asset_code})" ditolak oleh "${actor.name}"`,
        meta: {
          id_asset_borrowed: borrow.id_asset_borrowed,
          status: {
            from: borrow.status,
            to: updated.status,
          },
          rejected_by: {
            id_user: actor.id_user,
            name: actor.name,
            role: actor.role,
          },
          borrower: borrow.user
            ? {
                id_user: borrow.user.id_user,
                name: borrow.user.name,
              }
            : null,
          approval_note: input?.approval_note ?? null,
          asset_name: borrow.assetStock.asset.asset_name,
          asset_code: borrow.assetStock.asset.asset_code,
          quantity: borrow.quantity,
        },
      }),
    });

    return updated;
  });
}

static async refreshBorrowLateStatusById(id: number, tx: any = prisma) {
  const borrow = await tx.assetBorrowed.findUnique({
    where: { id_asset_borrowed: id },
  });

  if (!borrow) throw new Error("Data peminjaman tidak ditemukan");

  if (!borrow.due_date) return borrow;

  if (borrow.status !== "DIPINJAM" && borrow.status !== "TERLAMBAT") {
    return borrow;
  }

  const lateDays = calculateBorrowLateDays(new Date(borrow.due_date));

  const newStatus = lateDays > 0 ? "TERLAMBAT" : "DIPINJAM";

  return tx.assetBorrowed.update({
    where: { id_asset_borrowed: id },
    data: {
      late_days: lateDays,
      status: newStatus,
    },
  });
}

}
