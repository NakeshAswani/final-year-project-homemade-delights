import dotenv from "dotenv";
dotenv.config();
import { PrismaClient, OrderStatus } from "@prisma/client";
import { NextRequest } from "next/server";
import { handleResponse, tokenVerification } from "@/lib/utils";

const prisma = new PrismaClient();

export const POST = async (request: NextRequest) => {
    try {
        const user_id = Number(request.nextUrl.searchParams.get("user_id"));
        const address_id = Number(request.nextUrl.searchParams.get("address_id"));
        const token = request.headers.get('token');
        console.log('user_id', user_id);
        console.log('address_id', address_id);
        console.log('token', token);

        const tokenResponse = await tokenVerification(token, user_id);
        if (tokenResponse) return tokenResponse;

        const address = await prisma.address.findUnique({ where: { id: address_id } });
        if (!address) return handleResponse(400, "Address not found");
        if (address.user_id !== user_id) return handleResponse(403, "Forbidden: Address does not belong to the current user");

        const cart = await prisma.cart.findFirst({
            where: { user_id, user: { is_active: true } },
            include: { cartItems: true }
        });

        if (!cart || cart.cartItems.length === 0) return handleResponse(400, "Cart is empty");

        const order = await prisma.order.create({ data: { user_id, address_id } });
        const orderItems = cart.cartItems.map((item) => ({
            order_id: order.id, product_id: item.product_id, quantity: item.quantity
        }));

        await prisma.orderItem.createMany({ data: orderItems });
        await prisma.cartItem.deleteMany({ where: { cart_id: cart.id } });

        await Promise.all(orderItems.map(async (item) => {
            await prisma.product.update({
                where: { id: item.product_id },
                data: { stock: { decrement: item.quantity } }
            });
        }));

        return handleResponse(200, "Order status pending", { order_id: order.id });
    } catch (error: any) {
        return handleResponse(500, error.message);
    }
};

export const GET = async (request: NextRequest) => {
    try {
        const user_id = Number(request.nextUrl.searchParams.get("user_id"));
        if (user_id) {
            const token = request.headers.get('token');
            const tokenResponse = await tokenVerification(token, user_id);
            if (tokenResponse) return tokenResponse;

            const orders = await prisma.order.findMany({
                where: { user_id },
                include: { orderItems: { include: { product: true } } }
            });

            return handleResponse(200, "Orders found", orders);
        }

        const orders = await prisma.order.findMany();
        return handleResponse(200, "Orders found", orders);
    } catch (error: any) {
        return handleResponse(500, error.message);
    }
};

export const PUT = async (request: NextRequest) => {
    try {
        const token = request.headers.get('token');
        const { order_id, status } = await request.json() as { order_id: string, status: OrderStatus };

        const order = await prisma.order.findFirst({
            where: { id: Number(order_id) },
            include: { orderItems: true }
        });

        if (!order) return handleResponse(400, "Order not found");

        const tokenResponse = await tokenVerification(token, order.user_id);
        if (tokenResponse) return tokenResponse;

        const validTransitions: Record<OrderStatus, OrderStatus[]> = {
            PENDING: [],
            APPROVED: ["PENDING"],
            IN_TRANSIT: ["APPROVED"],
            DELIVERED: ["IN_TRANSIT"],
            CANCELLED: ["APPROVED", "PENDING"]
        };

        if (!validTransitions[status].includes(order.order_status)) {
            return handleResponse(400, "Invalid order status transition");
        }

        await prisma.order.update({
            where: { id: Number(order_id) },
            data: { order_status: status }
        });

        if (status === "CANCELLED") {
            await Promise.all(order.orderItems.map(async (item) => {
                await prisma.product.update({
                    where: { id: item.product_id },
                    data: { stock: { increment: item.quantity } }
                });
            }));
        }

        return handleResponse(200, "Order status updated successfully", { order_status: status });
    } catch (error: any) {
        return handleResponse(500, error.message);
    }
};