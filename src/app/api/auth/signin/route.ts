import dotenv from "dotenv";
dotenv.config();
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { handleResponse } from "@/lib/utils";

const prisma = new PrismaClient();

export const POST = async (request: NextRequest) => {
    try {
        const { email, password } = await request.json() as { email: string, password: string };

        const user = await prisma.user.findFirst({
            where: { email, password }
        });

        if (!user) {
            return handleResponse(404, "User not found");
        }

        if (!user.is_active) {
            return handleResponse(403, "User is deactivated. Do you want to activate it?");
        }

        if (!process.env.JWT_TOKEN_KEY) {
            throw new Error("JWT_TOKEN_KEY is not defined in environment variables");
        }

        const token = jwt.sign(user, process.env.JWT_TOKEN_KEY, { expiresIn: "365d" });

        return handleResponse(200, "User logged in successfully", { ...user, token });
    }
    catch (error: any) {
        return handleResponse(500, error.message);
    }
};

export const PATCH = async (request: NextRequest) => {
    try {
        const id = Number(request.nextUrl.searchParams.get("id"));

        let user = await prisma.user.findUnique({
            where: { id }
        });

        if (!user) {
            return handleResponse(404, "User not found");
        }

        user = await prisma.user.update({
            where: { id },
            data: { is_active: true }
        });

        if (!process.env.JWT_TOKEN_KEY) {
            throw new Error("JWT_TOKEN_KEY is not defined in environment variables");
        }

        const token = jwt.sign(user, process.env.JWT_TOKEN_KEY, { expiresIn: "30d" });
        return handleResponse(200, "User activated successfully", { ...user, token });
    }
    catch (error: any) {
        return handleResponse(500, error.message);
    }
};