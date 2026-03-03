import { PrismaClient } from "@prisma/client";

type TxLike = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

export type AssetLogAction =
  | "ASSET_STOCK_UPDATE" 
  | "ASSET_STOCK_CREATE"//only this
  | "ASSET_STOCK_DELETE"//only this
  | "ASSET_UPDATE"
  | "ASSET_CREATE"
  | "ASSET_DELETE"
  | "ASSET_CATEGORIES_UPDATE"
  | "ASSET_CATEGORIES_CREATE"
  | "ASSET_CATEGORIES_DELETE"
  | "USER(KARYAWAN)_UPDATE"
  | "USER(KARYAWAN)_CREATE"
  | "USER(KARYAWAN)_DELETE"
  | "RENTAL_CUSTOMER_UPDATE"
  | "RENTAL_CUSTOMER_CREATE"
  | "RENTAL_CUSTOMER_DELETE"
  | "ASSET_TYPE_UPDATE"
  | "ASSET_TYPE_CREATE"
  | "ASSET_TYPE_DELETE"
  | "LOCATION_UPDATE"
  | "LOCATION_CREATE"
  | "LOCATION_DELETE"
  | "BORROW_CREATE" // from here not yet
  | "BORROW_RETURN"
  | "BORROW_CANCEL"
  | "RENTAL_CREATE"
  | "RENTAL_FINISH"
  | "RENTAL_CANCEL"
  | "MAINTENANCE_CREATE"
  | "MAINTENANCE_DONE"
  | "STOCK_UPDATE"
  | "STOCK_MOVE"
  | "DELETE_HISTORY"
  | "OTHER";

type LogMeta = Record<string, any>;

function safeJson(meta: LogMeta) {
  try {
    return JSON.stringify(meta);
  } catch {
    // fallback kalau ada circular
    return String(meta);
  }
}

/**
 * Format description yang konsisten:
 * - human readable
 * - + meta JSON (biar gampang audit)
 */
export function buildLogDescription(params: {
  title: string;              // ringkas: "Borrow dibuat"
  detail?: string;            // kalimat tambahan bebas
  meta?: LogMeta;             // data terstruktur
}) {
  const { title, detail, meta } = params;

  const lines: string[] = [];
  lines.push(title);

  if (detail) lines.push(detail);

  if (meta && Object.keys(meta).length) {
    lines.push(`META=${safeJson(meta)}`);
  }

  return lines.join(" | ");
}

/**
 * createAssetLog:
 * - bisa pakai prisma biasa atau tx dari $transaction
 */
export async function createAssetLog(
  db: TxLike,
  input: { action: AssetLogAction; description: string }
) {
  return db.assetLogs.create({
    data: {
      action: input.action,
      description: input.description,
    },
  });
}