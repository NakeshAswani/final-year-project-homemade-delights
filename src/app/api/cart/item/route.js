import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export const POST = async (request) => {
    try {
        const { user_id, product_id, quantity } = await request.json();

        let cart = await prisma.cart.findFirst({ where: { user_id } });

        if (!cart) {
            cart = await prisma.cart.create({ data: { user_id } });
        }

        const existingCartItem = await prisma.cartItem.findFirst({ where: { cart_id: cart.id, product_id } });

        if (existingCartItem) {
            await prisma.cartItem.update({ where: { id: existingCartItem.id }, data: { quantity: existingCartItem.quantity + (quantity || 1) } });
        }
        else {
            await prisma.cartItem.create({ data: { cart_id: cart.id, product_id, quantity: quantity || 1 } });
        }

        return NextResponse.json({ status: 201, "message": "Item added successfully" });
    }
    catch (error) {
        return NextResponse.json({ status: 500, error: error.message });
    }
}

export const DELETE = async (request) => {
    try {
        const id = await Number(request.nextUrl.searchParams.get("id"));

        await prisma.cartItem.delete({ where: { id } });

        return NextResponse.json({ status: 200, "message": "Item removed successfully" });
    }
    catch (error) {
        return NextResponse.json({ status: 500, error: error.message });
    }
};
