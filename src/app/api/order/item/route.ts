import dotenv from "dotenv";
dotenv.config();
import { PrismaClient } from "@prisma/client";
import { NextRequest } from "next/server";
import { handleResponse, tokenVerification } from "@/lib/utils";

const prisma = new PrismaClient();

export const GET = async (request: NextRequest) => {
    try {
        const order_id = Number(request.nextUrl.searchParams.get("order_id"));
        const token = request.headers.get('token');

        const order = await prisma.order.findUnique({ where: { id: order_id } });
        if (!order) return handleResponse(400, "Order not found");

        const tokenResponse = await tokenVerification(token, order.user_id);
        if (tokenResponse) return tokenResponse;

        const orderItems = await prisma.orderItem.findMany({
            where: { order_id },
            include: { product: true }
        });

        if (orderItems.length === 0) return handleResponse(400, "Order items not found");

        return handleResponse(200, "Order items found", orderItems);
    } catch (error: any) {
        return handleResponse(500, error.message);
    }
};