import { PrismaClient, OrderStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export const POST = async (request: NextRequest) => {
    try {
        const user_id = await Number(request.nextUrl.searchParams.get("user_id"));

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
            data: { user_id }
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
        const user_id = await Number(request.nextUrl.searchParams.get("user_id"));

        if (user_id) {
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