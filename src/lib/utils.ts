import { clsx, type ClassValue } from "clsx"
import { NextResponse } from "next/server";
import { twMerge } from "tailwind-merge"
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Utility function for consistent JSON responses with HTTP status codes.
 */
export const handleResponse = (status: number, message: string, data?: any) => {
  return data ? NextResponse.json({ status, message, data }, { status }) : NextResponse.json({ status, message }, { status });
};

/**
* Token verification function
*/
export const tokenVerification = async (token: string | null, user_id: number | null) => {
  if (!token) return handleResponse(401, "Unauthorized");
  if (!user_id) return handleResponse(400, "User ID is required");
  if (!process.env.JWT_TOKEN_KEY) throw new Error("JWT_TOKEN_KEY is not defined in environment variables");

  try {
    jwt.verify(token, process.env.JWT_TOKEN_KEY);
  } catch {
    return handleResponse(403, "Token Not Verified!");
  }

  const decodedToken: any = jwt.decode(token);
  if (decodedToken.id !== user_id) {
    return handleResponse(403, "Forbidden: Token does not belong to the current user");
  }
};

export const userPublicFields = {
  id: true,
  name: true,
  email: true,
  role: true,
  is_active: true,
  created_at: true,
  updated_at: true,
  addresses: true,
  categories: true,
  products: true,
  carts: true,
  orders: true
};

export async function hashPassword(password: string) {
  const saltRounds = 10;
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  } catch (error) {
    throw error;
  }
}

export async function comparePassword(password: string, hashedPassword: string) {
  try {
    const match = await bcrypt.compare(password, hashedPassword);
    return match; // Returns true if the password matches, false otherwise
  } catch (error) {
    throw error;
  }
}

export const capitalizeWords = (str: string) => {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
};