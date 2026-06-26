const MS_PER_DAY = 1000 * 60 * 60 * 24;

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getBooleanEnv(value?: string) {
  return value === "true" || value === "1";
}

function getFinePerDay(assetRentalPrice?: number) {
  const useCustomFine = getBooleanEnv(process.env.SET_HARGA_DENDA);

  if (useCustomFine) {
    const customFine = Number(process.env.HARGA_DENDA ?? 0);

    if (!Number.isFinite(customFine) || customFine < 0) {
      throw new Error("Konfigurasi HARGA_DENDA tidak valid");
    }

    return customFine;
  }

  const rentalPrice = Number(assetRentalPrice ?? 0);

  if (!Number.isFinite(rentalPrice) || rentalPrice <= 0) {
    throw new Error("Harga rental asset tidak valid untuk menghitung denda");
  }

  return rentalPrice;
}

export function calculateRentalDays(startDate: Date, endDate: Date) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const diffMs = end.getTime() - start.getTime();

  if (diffMs <= 0) {
    return 0;
  }

  return Math.ceil(diffMs / MS_PER_DAY);
}

export function calculateLateDays(rentalEnd: Date, comparedDate = new Date()) {
  const end = startOfDay(rentalEnd);
  const current = startOfDay(comparedDate);

  if (current <= end) {
    return 0;
  }

  const diffMs = current.getTime() - end.getTime();

  return Math.ceil(diffMs / MS_PER_DAY);
}

export function calculateFineAmount(params: {
  rentalEnd: Date;
  quantity: number;
  assetRentalPrice?: number;
  comparedDate?: Date;
}) {
  const lateDays = calculateLateDays(
    params.rentalEnd,
    params.comparedDate ?? new Date()
  );

  const finePerDay = getFinePerDay(params.assetRentalPrice);

  const fineAmount = lateDays * finePerDay * params.quantity;

  return {
    lateDays,
    fineAmount,
    finePerDay,
  };
}

export function calculatePaymentStatus(params: {
  totalBill: number;
  paidAmount: number;
}) {
  const { totalBill, paidAmount } = params;

  if (paidAmount <= 0) {
    return "BELUM_BAYAR" as const;
  }

  if (paidAmount >= totalBill) {
    return "LUNAS" as const;
  }

  return "DP" as const;
}