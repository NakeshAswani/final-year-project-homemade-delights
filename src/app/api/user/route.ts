import dotenv from "dotenv";
dotenv.config();
import { PrismaClient, Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { handleResponse, tokenVerification, userPublicFields } from "@/lib/utils";

const prisma = new PrismaClient();

export const GET = async (request: NextRequest) => {
    try {
        const id = Number(request.nextUrl.searchParams.get("id"));

        if (id) {
            const token = request.headers.get("token");
            const tokenResponse = await tokenVerification(token, id);
            if (tokenResponse) return tokenResponse;

            const user = await prisma.user.findUnique({
                where: { id },
                select: userPublicFields
            });

            if (!user) {
                return handleResponse(404, "User not found");
            }
            return handleResponse(200, "User Found", user);
        } else {
            const users = await prisma.user.findMany({
                select: {
                    ...userPublicFields,
                    addresses: true
                }
            });
            return handleResponse(200, "Users Found", users);
        }
    } catch (error: any) {
        return handleResponse(500, error.message);
    }
};

export const PUT = async (request: NextRequest) => {
    try {
        const id = Number(request.nextUrl.searchParams.get("id"));
        const token = request.headers.get("token");
        const tokenResponse = await tokenVerification(token, id);
        if (tokenResponse) return tokenResponse;

        const { name, email, role } = await request.json() as { name: string; email: string; role: Role };

        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            return handleResponse(404, "User not found");
        }

        await prisma.user.update({ where: { id }, data: { name, email, role } });

        return handleResponse(200, "User updated successfully");
    } catch (error: any) {
        return handleResponse(500, error.message);
    }
};

export const PATCH = async (request: NextRequest) => {
    try {
        const id = Number(request.nextUrl.searchParams.get("id"));
        const token = request.headers.get("token");
        const tokenResponse = await tokenVerification(token, id);
        if (tokenResponse) return tokenResponse;

        const { password } = await request.json() as { password: string };

        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            return NextResponse.json({ status: 404, error: "User not found" });
        }

        await prisma.user.update({ where: { id }, data: { password } });

        return handleResponse(200, "Password updated successfully");
    } catch (error: any) {
        return handleResponse(500, error.message);
    }
};

export const DELETE = async (request: NextRequest) => {
    try {
        const id = Number(request.nextUrl.searchParams.get("id"));
        const token = request.headers.get("token");
        const tokenResponse = await tokenVerification(token, id);
        if (tokenResponse) return tokenResponse;

        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            return NextResponse.json({ status: 404, error: "User not found" });
        }

        await prisma.user.update({ where: { id }, data: { is_active: false } });

        return handleResponse(200, "User deactivated successfully");
    } catch (error: any) {
        return handleResponse(500, error.message);
    }
};