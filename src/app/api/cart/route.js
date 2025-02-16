import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export const POST = async (request) => {
    try {
        const user_id = await Number(request.nextUrl.searchParams.get("user_id"));

        if (!user_id) {
            return NextResponse.json({ error: "User id is required" }, { status: 400 });
        }

        let cart = await prisma.cart.findFirst({ where: { user_id }, include: { cartItems: true } });

        if (!cart) {
            cart = await prisma.cart.create({ data: { user_id } });
        }

        return NextResponse.json({ status: 201, "message": "Cart created successfully" });
    }
    catch (error) {
        return NextResponse.json({ status: 500, error: error.message });
    }
}

export const GET = async (request) => {
    try {
        const user_id = await Number(request.nextUrl.searchParams.get("user_id"));

        const cart = await prisma.cart.findFirst({ where: { user_id }, include: { cartItems: { include: { product: true } } } });

        if (!cart) {
            return NextResponse.json({ error: "Cart not found" }, { status: 404 });
        }

        return NextResponse.json(cart, { status: 200 });
    }
    catch (error) {
        return NextResponse.json({ status: 500, error: error.message });
    }
}