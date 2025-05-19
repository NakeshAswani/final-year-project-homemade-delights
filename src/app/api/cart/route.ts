import dotenv from "dotenv";
dotenv.config();
import { PrismaClient } from "@prisma/client";
import { NextRequest } from "next/server";
import { handleResponse, tokenVerification, userPublicFields } from "@/lib/utils";

const prisma = new PrismaClient();

export const POST = async (request: NextRequest) => {
    try {
        const user_id = Number(request.nextUrl.searchParams.get("user_id"));
        const token = request.headers.get("token");
        const tokenResponse = await tokenVerification(token, user_id);
        if (tokenResponse) return tokenResponse;

        const user = await prisma.user.findUnique({ where: { id: user_id } });
        if (!user) return handleResponse(400, "User not found");

        const cart = await prisma.cart.findFirst({ where: { user_id } });

        if (user.role === "BUYER" && !cart) {
            const cart = await prisma.cart.create({ data: { user_id } });
            return handleResponse(201, "Cart created successfully", cart);
        }

        return handleResponse(200, "Cart Already Exist", cart);
    } catch (error: any) {
        return handleResponse(500, error.message);
    }
};

export const GET = async (request: NextRequest) => {
    try {
        const user_id = Number(request.nextUrl.searchParams.get("user_id"));
        const token = request.headers.get("token");
        const tokenResponse = await tokenVerification(token, user_id);
        if (tokenResponse) return tokenResponse;

        const cart = await prisma.cart.findFirst({
            where: { user_id, user: { is_active: true } },
            include: {
                cartItems: {
                    include: { product: true }
                },
                user: { select: userPublicFields }
            }
        });

        if (!cart) return handleResponse(400, "Cart not found");

        return handleResponse(200, "Cart found", cart);
    } catch (error: any) {
        return handleResponse(500, error.message);
    }
};