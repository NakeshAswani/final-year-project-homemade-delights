import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export const POST = async (request: NextRequest) => {
    try {
        const user_id = Number(request.nextUrl.searchParams.get("user_id"));

        if (!user_id) {
            return NextResponse.json({
                status: 400,
                error: "User id is required"
            });
        }

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
            where: { user_id },
            include: { cartItems: true }
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
