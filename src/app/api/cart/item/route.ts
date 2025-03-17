import dotenv from "dotenv";
dotenv.config();
import { PrismaClient } from "@prisma/client";
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
        const token = request.headers.get('token');

        const { user_id, product_id, quantity } = await request.json() as { user_id: number, product_id: number, quantity?: number };

        const tokenResponse = await token_verification(token, user_id);
        if (tokenResponse) return tokenResponse;

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
        const id = Number(request.nextUrl.searchParams.get("id"));
        const token = request.headers.get('token');
        
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
        
        const cart = await prisma.cart.findUnique({
            where: { id: existingCartItem.cart_id }
        });
        
        if (!cart) {
            return NextResponse.json({
                status: 400,
                error: "Cart not found"
            });
        }
        
        const tokenResponse = await token_verification(token, cart.user_id);
        if (tokenResponse) return tokenResponse;
        
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
