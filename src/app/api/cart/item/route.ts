import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export const POST = async (request: NextRequest) => {
    try {
        const { user_id, product_id, quantity } = await request.json() as { user_id: number, product_id: number, quantity?: number };

        const user = await prisma.user.findUnique({
            where: { id: user_id }
        });

        if (!user) {
            return NextResponse.json({
                status: 400,
                error: "User not found"
            });
        }

        let cart = await prisma.cart.findFirst({
            where: { user_id }
        });

        if (user.role == "BUYER" && user.is_active && !cart) {
            cart = await prisma.cart.create({
                data: { user_id }
            });
        }

        if (!cart) {
            return NextResponse.json({
                status: 400,
                error: "Cart not found"
            });
        }

        const existingCartItem = await prisma.cartItem.findFirst({
            where: { cart_id: cart.id, product_id }
        });

        if (existingCartItem) {
            await prisma.cartItem.update({
                where: { id: existingCartItem.id },
                data: { quantity: existingCartItem.quantity + (quantity || 1) }
            });
        }
        else {
            await prisma.cartItem.create({
                data: { cart_id: cart.id, product_id, quantity: quantity || 1 }
            });
        }

        return NextResponse.json({
            status: 201,
            "message": "Item added successfully"
        });
    }
    catch (error: any) {
        return NextResponse.json({
            status: 500,
            error: error.message
        });
    }
}

export const DELETE = async (request: NextRequest) => {
    try {
        const id = await Number(request.nextUrl.searchParams.get("id"));

        if (!id) {
            return NextResponse.json({
                status: 400,
                error: "Item id is required"
            });
        }

        const existingCartItem = await prisma.cartItem.findUnique({
            where: { id }
        });

        if (!existingCartItem) {
            return NextResponse.json({
                status: 400,
                error: "Item not found"
            });
        }

        if (existingCartItem.quantity > 1) {
            await prisma.cartItem.update({
                where: { id },
                data: { quantity: existingCartItem.quantity - 1 }
            });
        }
        else {
            await prisma.cartItem.delete({
                where: { id }
            });
        }

        return NextResponse.json({
            status: 200,
            "message": "Item removed successfully"
        });
    }
    catch (error: any) {
        return NextResponse.json({
            status: 500,
            error: error.message
        });
    }
};
