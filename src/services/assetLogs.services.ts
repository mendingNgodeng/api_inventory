import { prisma } from "../utils/prisma";

type ListParams = {
  take?: number;
  skip?: number;
};

function list(params?: ListParams) {
  return {
    orderBy: { created_at: "desc" as const }, 
    take: params?.take,
    skip: params?.skip,
  };
}

export class assetLogsService {
  static async getAll(params?: ListParams) {
    return prisma.assetLogs.findMany({
      ...list(params),
    });
  }

  static async get(params?: ListParams) {
    return prisma.assetLogs.findMany({
      ...list(params),
    });
  }

  static async getById(id: number) {
    return prisma.assetLogs.findUnique({
      where: { id_asset_logs: id },
    });
  }

  // ✅ helper biar rapi untuk filter action list
  private static async getByActions(actions: string[], params?: ListParams) {
    return prisma.assetLogs.findMany({
      where: { action: { in: actions } },
      ...list(params),
    });
  }

  // =========================
  // LOCATION
  // =========================
  static async getLocation(params?: ListParams) {
    return this.getByActions(
      ["LOCATION_CREATE", "LOCATION_UPDATE", "LOCATION_DELETE"],
      params
    );
  }

  // =========================
  // RENTAL CUSTOMER
  // =========================
  static async getRentalCustomer(params?: ListParams) {
    return this.getByActions(
      ["RENTAL_CUSTOMER_CREATE", "RENTAL_CUSTOMER_UPDATE", "RENTAL_CUSTOMER_DELETE"],
      params
    );
  }

  // =========================
  // USER (KARYAWAN)
  // =========================
  static async getUser(params?: ListParams) {
    return this.getByActions(
      ["USER(KARYAWAN)_CREATE", "USER(KARYAWAN)_UPDATE", "USER(KARYAWAN)_DELETE"],
      params
    );
  }

  // =========================
  // ASSET MASTER
  // =========================
  static async getAsset(params?: ListParams) {
    return this.getByActions(
      ["ASSET_CREATE", "ASSET_UPDATE", "ASSET_DELETE"],
      params
    );
  }

  // =========================
  // ASSET STOCK
  // =========================
  static async getAssetStock(params?: ListParams) {
    return this.getByActions(
      ["ASSET_STOCK_CREATE", "ASSET_STOCK_UPDATE", "ASSET_STOCK_DELETE", "STOCK_UPDATE", "STOCK_MOVE"],
      params
    );
  }

  // =========================
  // ASSET TYPES
  // =========================
  static async getTypes(params?: ListParams) {
    return this.getByActions(
      ["ASSET_TYPE_CREATE", "ASSET_TYPE_UPDATE", "ASSET_TYPE_DELETE"],
      params
    );
  }

  // =========================
  // ASSET CATEGORIES
  // =========================
  static async getCategories(params?: ListParams) {
    return this.getByActions(
      ["ASSET_CATEGORIES_CREATE", "ASSET_CATEGORIES_UPDATE", "ASSET_CATEGORIES_DELETE"],
      params
    );
  }

  // =========================
  // RENTAL
  // =========================
  static async getRental(params?: ListParams) {
    return this.getByActions(
      ["RENTAL_CREATE", "RENTAL_FINISH", "RENTAL_CANCEL"],
      params
    );
  }

  // =========================
  // BORROW + USED
  // =========================
  static async getBorrow(params?: ListParams) {
    return this.getByActions(
      ["BORROW_CREATE", "BORROW_RETURN", "BORROW_CANCEL", "USED_CREATE", "USED_RETURN"],
      params
    );
  }

  // =========================
  // MAINTENANCE
  // =========================
  static async getMaintenance(params?: ListParams) {
    return this.getByActions(
      ["MAINTENANCE_CREATE", "MAINTENANCE_DONE"],
      params
    );
  }

  // =========================
  // OPTIONAL: DELETE HISTORY / OTHER
  // =========================
  static async getDeleteHistory(params?: ListParams) {
    return this.getByActions(["DELETE_HISTORY"], params);
  }

  static async getOther(params?: ListParams) {
    return this.getByActions(["OTHER"], params);
  }
}