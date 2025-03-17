import dotenv from "dotenv";
dotenv.config();
import { PrismaClient } from "@prisma/client";
import { NextRequest } from "next/server";
import { handleResponse, tokenVerification } from "@/lib/utils";

const prisma = new PrismaClient();

export const POST = async (request: NextRequest) => {
    try {
        const token = request.headers.get("token");
        const { user_id, product_id, quantity } = await request.json() as { user_id: number, product_id: number, quantity?: number };

        const tokenResponse = await tokenVerification(token, user_id);
        if (tokenResponse) return tokenResponse;

        const user = await prisma.user.findUnique({ where: { id: user_id } });
        if (!user) return handleResponse(400, "User not found");

        let cart = await prisma.cart.findFirst({ where: { user_id } });
        if (user.role === "BUYER" && user.is_active && !cart) {
            cart = await prisma.cart.create({ data: { user_id } });
        }
        if (!cart) return handleResponse(400, "Cart not found");

        const existingCartItem = await prisma.cartItem.findFirst({
            where: { cart_id: cart.id, product_id }
        });

        if (existingCartItem) {
            await prisma.cartItem.update({
                where: { id: existingCartItem.id },
                data: { quantity: existingCartItem.quantity + (quantity || 1) }
            });
        } else {
            await prisma.cartItem.create({
                data: { cart_id: cart.id, product_id, quantity: quantity || 1 }
            });
        }

        return handleResponse(201, "Item added successfully");
    } catch (error: any) {
        return handleResponse(500, error.message);
    }
};

export const DELETE = async (request: NextRequest) => {
    try {
        const id = Number(request.nextUrl.searchParams.get("id"));
        const token = request.headers.get("token");

        if (!id) return handleResponse(400, "Item id is required");

        const existingCartItem = await prisma.cartItem.findUnique({ where: { id } });
        if (!existingCartItem) return handleResponse(400, "Item not found");

        const cart = await prisma.cart.findUnique({ where: { id: existingCartItem.cart_id } });
        if (!cart) return handleResponse(400, "Cart not found");

        const tokenResponse = await tokenVerification(token, cart.user_id);
        if (tokenResponse) return tokenResponse;

        if (existingCartItem.quantity > 1) {
            await prisma.cartItem.update({
                where: { id },
                data: { quantity: existingCartItem.quantity - 1 }
            });
        } else {
            await prisma.cartItem.delete({ where: { id } });
        }

        return handleResponse(200, "Item removed successfully");
    } catch (error: any) {
        return handleResponse(500, error.message);
    }
};