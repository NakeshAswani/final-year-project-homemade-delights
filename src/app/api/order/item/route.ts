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

export const GET = async (request: NextRequest) => {
    try {
        const order_id = Number(request.nextUrl.searchParams.get("order_id"));
        const token = request.headers.get('token');
        
        const orderItems = await prisma.orderItem.findMany({
            where: { order_id },
            include: { product: true }
        });

        if (!orderItems) {
            return NextResponse.json({
                status: 400,
                error: "Order items not found"
            });
        }

        const order = await prisma.order.findUnique({
            where: { id: order_id }
        });

        if (!order) {
            return NextResponse.json({
                status: 400,
                error: "Order not found"
            });
        }

        const tokenResponse = await token_verification(token, order.user_id);
        if (tokenResponse) return tokenResponse;

        return NextResponse.json({
            status: 200,
            message: "Order items found",
            data: orderItems
        });
    }
    catch (error: any) {
        return NextResponse.json({
            status: 500,
            error: error.message
        });
    }
}