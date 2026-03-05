import type { Context, Next } from "hono";

export const enableRegister = async (c: Context, next: Next) => {
  if (process.env.ENABLE_REGISTER !== "true") {
    return c.json({ message: "Registration is disabled" }, 404);
  }
  await next();
};