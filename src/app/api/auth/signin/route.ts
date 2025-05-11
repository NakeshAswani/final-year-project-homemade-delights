import dotenv from "dotenv";
dotenv.config();
import { PrismaClient } from "@prisma/client";
import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { comparePassword, handleResponse, userPublicFields } from "@/lib/utils";

const prisma = new PrismaClient();

export const POST = async (request: NextRequest) => {
    try {
        const { email, password } = await request.json() as { email: string, password: string };

        // Find user by email only
        const user = await prisma.user.findFirst({
            where: { email },
            select: { ...userPublicFields, password: true } // Include password for comparison
        });

        if (!user) {
            return handleResponse(404, "Invalid credentials");
        }

        // Compare hashed password
        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            return handleResponse(401, "Invalid credentials");
        }

        if (!user.is_active) {
            return handleResponse(403, "User is deactivated. Do you want to activate it?");
        }

        if (!process.env.JWT_TOKEN_KEY) {
            throw new Error("JWT_TOKEN_KEY is not defined in environment variables");
        }

        // Remove password before creating token
        const { password: _, ...userWithoutPassword } = user;
        const token = jwt.sign(userWithoutPassword, process.env.JWT_TOKEN_KEY, {
            expiresIn: "365d"
        });

        return handleResponse(200, "User logged in successfully", {
            ...userWithoutPassword,
            token
        });
    }
    catch (error: any) {
        return handleResponse(500, error.message);
    }
};

export const PATCH = async (request: NextRequest) => {
    try {
        const id = Number(request.nextUrl.searchParams.get("id"));

        let user = await prisma.user.findUnique({
            where: { id },
            select: userPublicFields
        });

        if (!user) {
            return handleResponse(404, "User not found");
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: { is_active: true },
            select: userPublicFields
        });

        if (!process.env.JWT_TOKEN_KEY) {
            throw new Error("JWT_TOKEN_KEY is not defined in environment variables");
        }

        const token = jwt.sign(updatedUser, process.env.JWT_TOKEN_KEY, {
            expiresIn: "30d"
        });

        return handleResponse(200, "User activated successfully", {
            ...updatedUser,
            token
        });
    }
    catch (error: any) {
        return handleResponse(500, error.message);
    }
};