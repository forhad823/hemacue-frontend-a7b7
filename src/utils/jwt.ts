import jwt, { type JwtPayload } from "jsonwebtoken";

export type TDecodedToken = JwtPayload & {
  userId: string;
  name: string;
  email: string;
  role: string; // "ADMIN" | "PATIENT" | "DONOR"
  bloodGroup?: string | null;
};

const verifyToken = (token: string, secret: string) => {
  try {
    const data = jwt.verify(token, secret) as TDecodedToken;
    return { success: true as const, data };
  } catch (error) {
    return { success: false as const, error: (error as Error).message };
  }
};

export const jwtUtils = { verifyToken };
