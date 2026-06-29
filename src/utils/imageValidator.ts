// src/utils/imageValidator.ts

export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type AllowedImageMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number];

type ValidateBase64ImageOptions = {
  required?: boolean;
  maxSizeMB?: number;
  allowedMimeTypes?: readonly string[];
  fieldName?: string;
};

export type ValidatedBase64Image = {
  dataUrl: string;
  mimeType: string;
  sizeBytes: number;
  sizeMB: number;
  base64: string;
};

const DEFAULT_MAX_SIZE_MB = Number(process.env.IMAGE_UPLOAD_MAX_MB ?? 2);

function parseDataUrl(value: string) {
  const match = value.match(/^data:([^;]+);base64,(.+)$/);

  if (!match) {
    return null;
  }

  return {
    mimeType: match[1],
    base64: match[2].replace(/\s/g, ""),
  };
}

function getBase64SizeBytes(base64: string) {
  const cleanBase64 = base64.replace(/\s/g, "");
  const padding = cleanBase64.endsWith("==")
    ? 2
    : cleanBase64.endsWith("=")
      ? 1
      : 0;

  return Math.floor((cleanBase64.length * 3) / 4) - padding;
}

function isValidBase64(base64: string) {
  if (!base64) return false;

  // base64 standar
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(base64)) {
    return false;
  }

  // panjang base64 harus kelipatan 4
  return base64.length % 4 === 0;
}

function hasValidImageSignature(mimeType: string, base64: string) {
  const buffer = Buffer.from(base64.slice(0, 64), "base64");

  if (mimeType === "image/jpeg") {
    return buffer.length >= 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff;
  }

  if (mimeType === "image/png") {
    return buffer.length >= 8 &&
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a;
  }

  if (mimeType === "image/webp") {
    return buffer.length >= 12 &&
      buffer.toString("ascii", 0, 4) === "RIFF" &&
      buffer.toString("ascii", 8, 12) === "WEBP";
  }

  return false;
}

export function validateBase64Image(
  value: unknown,
  options: ValidateBase64ImageOptions = {}
): ValidatedBase64Image | null {
  const {
    required = true,
    maxSizeMB = DEFAULT_MAX_SIZE_MB,
    allowedMimeTypes = ALLOWED_IMAGE_MIME_TYPES,
    fieldName = "Foto",
  } = options;

  if (!value) {
    if (required) {
      throw new Error(`${fieldName} wajib diisi`);
    }

    return null;
  }

  if (typeof value !== "string") {
    throw new Error(`${fieldName} harus berupa string base64`);
  }

  const parsed = parseDataUrl(value);

  if (!parsed) {
    throw new Error(
      `${fieldName} harus menggunakan format base64 data URL, contoh: data:image/jpeg;base64,...`
    );
  }

  const { mimeType, base64 } = parsed;

  if (!allowedMimeTypes.includes(mimeType)) {
    throw new Error(
      `${fieldName} harus berupa gambar dengan format: ${allowedMimeTypes.join(", ")}`
    );
  }

  if (!isValidBase64(base64)) {
    throw new Error(`${fieldName} memiliki format base64 tidak valid`);
  }

  const sizeBytes = getBase64SizeBytes(base64);
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (sizeBytes > maxSizeBytes) {
    throw new Error(
      `${fieldName} maksimal ${maxSizeMB}MB. Ukuran saat ini ${(sizeBytes / 1024 / 1024).toFixed(2)}MB`
    );
  }

  if (!hasValidImageSignature(mimeType, base64)) {
    throw new Error(`${fieldName} tidak cocok dengan format gambar yang dikirim`);
  }

  return {
    dataUrl: value,
    mimeType,
    sizeBytes,
    sizeMB: Number((sizeBytes / 1024 / 1024).toFixed(2)),
    base64,
  };
}