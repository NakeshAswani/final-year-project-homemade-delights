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
        const user_id = Number(request.nextUrl.searchParams.get("user_id"));
        const token = request.headers.get('token');
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
            await prisma.cart.create({
                data: { user_id }
            });

            return NextResponse.json({
                status: 201,
                message: "Cart created successfully"
            });
        }

        return NextResponse.json({
            status: 400,
            message: "You can't create cart"
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
        const token = request.headers.get('token');
        const tokenResponse = await token_verification(token, user_id);
        if (tokenResponse) return tokenResponse;

        const cart = await prisma.cart.findFirst({
            where: { user_id, user: { is_active: true } },
            include: {
                cartItems: {
                    include: { product: true }
                }
            }
        });

        if (!cart) {
            return NextResponse.json({
                status: 400,
                error: "Cart not found"
            });
        }

        return NextResponse.json({
            status: 200,
            message: "Cart found",
            data: cart
        });
    }
    catch (error: any) {
        return NextResponse.json({
            status: 500,
            error: error.message
        });
    }
}
