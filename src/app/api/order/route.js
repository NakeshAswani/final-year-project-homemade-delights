import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export const POST = async (request) => {
    try {
        const user_id = await Number(request.nextUrl.searchParams.get("user_id"));

        const cart = await prisma.cart.findFirst({ where: { user_id }, include: { cartItems: true } });

        if (!cart || cart.cartItems.length === 0) {
            return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
        }

        const order = await prisma.order.create({ data: { user_id } });

        const orderItems = cart.cartItems.map((item) => ({ order_id: order.id, product_id: item.product_id, quantity: item.quantity }));

        await prisma.orderItem.createMany({ data: orderItems });

        await prisma.cartItem.deleteMany({ where: { cart_id: cart.id } });

        return NextResponse.json({ status: 200, "message": "Order status pending", order_id: order.id });
    }
    catch (error) {
        return NextResponse.json({ status: 500, error: error.message });
    }
}

export const GET = async (request) => {
    try {
        const user_id = await Number(request.nextUrl.searchParams.get("user_id"));

        const orders = await prisma.order.findMany({ where: { user_id }, include: { orderItems: { include: { product: true } } } });

        return NextResponse.json(orders, { status: 200 });
    }
    catch (error) {
        return NextResponse.json({ status: 500, error: error.message });
    }
};

export const PUT = async (request) => {
    try {
        const { order_id, status } = await request.json();

        await prisma.order.update({ where: { id: Number(order_id) }, data: { order_status: status } });

        return NextResponse.json({ status: 200, "message": "Order status updated successfully" });
    }
    catch (error) {
        return NextResponse.json({ status: 500, error: error.message });
    }
};