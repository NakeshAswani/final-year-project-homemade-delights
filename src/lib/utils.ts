import { clsx, type ClassValue } from "clsx"
import { NextResponse } from "next/server";
import { twMerge } from "tailwind-merge"
import jwt from "jsonwebtoken";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Utility function for consistent JSON responses with HTTP status codes.
 */
 export const handleResponse = (status: number, message: string, data: any = null) => {
  return NextResponse.json({ status, message, data }, { status });
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
