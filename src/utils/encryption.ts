// src/utils/encryption.ts

import crypto from "crypto";

const algorithm = "aes-256-cbc";
const key = Buffer.from(process.env.KTP_SECRET_KEY!, "utf-8").slice(0, 32);

export function encrypt(text: string) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  let encrypted = cipher.update(text, "utf8", "base64");
  encrypted += cipher.final("base64");

  return iv.toString("base64") + ":" + encrypted;
}

export function decrypt(data: string) {
  const [ivBase64, encryptedText] = data.split(":");
  const iv = Buffer.from(ivBase64, "base64");

  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedText, "base64", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}