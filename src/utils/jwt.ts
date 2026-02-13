import { sign, verify } from 'hono/jwt';

const algorithm = 'HS256';

const secret = process.env.JWT_SECRET as string
console.log("SECRET:", secret);

export const generateToken = async (
  payload: any,
  expiredIn: number = 60 * 60 //default
) => {
  const exp = Math.floor(Date.now() / 1000) + expiredIn;
  return await sign({ ...payload, exp }, secret,algorithm);
};

export const verifyToken = async (token: string) => {
  return await verify(token, secret,algorithm);
};

