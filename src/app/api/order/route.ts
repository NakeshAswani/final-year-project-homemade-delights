import dotenv from "dotenv";
dotenv.config();
import { PrismaClient, OrderStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

const token_verification = async (token: string | null, user_id: number | null) => {
    if (!token) {
        return NextResponse.json({
            status: 401,
            error: "Unauthorized"
        });
    }
    if (!user_id) {
        return NextResponse.json({
            status: 400,
            error: "User id is required"
        });
    }
    if (!process.env.JWT_TOKEN_KEY) {
        throw new Error("JWT_TOKEN_KEY is not defined in environment variables");
    }
    try {
        jwt.verify(token, process.env.JWT_TOKEN_KEY);
    }
    catch (error: any) {
        return NextResponse.json({
            status: 403,
            error: "Token Not Verified!"
        });
    }
    const decodedToken: any = jwt.decode(token!);
    if (decodedToken.id !== user_id) {
        return NextResponse.json({
            status: 403,
            error: "Forbidden: Token does not belong to the current user"
        });
    }
}

export const POST = async (request: NextRequest) => {
    try {
        const user_id = Number(request.nextUrl.searchParams.get("user_id"));
        const address_id = Number(request.nextUrl.searchParams.get("address_id"));
        const token = request.headers.get('token');
        const tokenResponse = await token_verification(token, user_id);
        if (tokenResponse) return tokenResponse;

        const address = await prisma.address.findUnique({
            where: { id: address_id }
        });

        if (!address) {
            return NextResponse.json({
                status: 400,
                error: "Address not found"
            });
        }

        if (address.user_id !== user_id) {
            return NextResponse.json({
                status: 403,
                error: "Forbidden: Address does not belong to the current user"
            });
        }

        const cart = await prisma.cart.findFirst({
            where: { user_id, user: { is_active: true } },
            include: { cartItems: true }
        });

        if (!cart || cart.cartItems.length === 0) {
            return NextResponse.json({
                status: 400,
                error: "Cart is empty"
            });
        }

        const order = await prisma.order.create({
            data: { user_id, address_id }
        });
        const orderItems = cart.cartItems.map((item) => ({
            order_id: order.id, product_id: item.product_id, quantity: item.quantity
        }));

        await prisma.orderItem.createMany({
            data: orderItems
        });
        await prisma.cartItem.deleteMany({
            where: { cart_id: cart.id }
        });

        await Promise.all(orderItems.map(async (item) => {
            await prisma.product.update({
                where: { id: item.product_id },
                data: {
                    stock: {
                        decrement: item.quantity
                    }
                }
            });
        }));

        return NextResponse.json({
            status: 200,
            message: "Order status pending",
            order_id: order.id
        });
    }
    catch (error: any) {
        return NextResponse.json({
            status: 500,
            error: error.message
        });
    }
}

export const GET = async (request: NextRequest) => {
    try {
        const user_id = Number(request.nextUrl.searchParams.get("user_id"));

        if (user_id) {
            const token = request.headers.get('token');
            const tokenResponse = await token_verification(token, user_id);
            if (tokenResponse) return tokenResponse;

            const orders = await prisma.order.findMany({
                where: { user_id },
                include: {
                    orderItems: {
                        include: { product: true }
                    }
                }
            });

            return NextResponse.json({
                status: 200,
                message: "Orders found",
                data: orders
            });
        }
        else {
            const orders = await prisma.order.findMany();

            return NextResponse.json({
                status: 200,
                message: "Orders found",
                data: orders
            });
        }
    }
    catch (error: any) {
        return NextResponse.json({
            status: 500,
            error: error.message
        });
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

        if (!order) {
            return NextResponse.json({
                status: 400,
                error: "Order not found"
            });
        }

        const tokenResponse = await token_verification(token, order.user_id);
        if (tokenResponse) return tokenResponse;

        if (status === "CANCELLED" && (order.order_status === "APPROVED" || order.order_status === "PENDING")) {
            await prisma.order.update({
                where: { id: Number(order_id) },
                data: { order_status: status }
            });

            await Promise.all(order.orderItems.map(async (item) => {
                await prisma.product.update({
                    where: { id: item.product_id },
                    data: {
                        stock: {
                            increment: item.quantity
                        }
                    }
                });
            }));
        }

        else if (status === "APPROVED" && order.order_status === "PENDING") {
            await prisma.order.update({
                where: { id: Number(order_id) },
                data: { order_status: status }
            });
        }

        else if (status === "IN_TRANSIT" && order.order_status === "APPROVED") {
            await prisma.order.update({
                where: { id: Number(order_id) },
                data: { order_status: status }
            });
        }

        else if (status === "DELIVERED" && order.order_status === "IN_TRANSIT") {
            await prisma.order.update({
                where: { id: Number(order_id) },
                data: { order_status: status }
            });
        }

        else if (status === "PENDING") {
            return NextResponse.json({
                status: 400,
                message: "Order status cannot be updated to pending"
            });
        }

        else {
            return NextResponse.json({
                status: 400,
                message: "Invalid order status"
            });
        }

        return NextResponse.json({
            status: 200,
            message: "Order status updated successfully",
            order_status: status
        });
    }
    catch (error: any) {
        return NextResponse.json({
            status: 500,
            error: error.message
        });
    }
};