import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export const GET = async (request: NextRequest) => {
    try {
        const order_id = await Number(request.nextUrl.searchParams.get("order_id"));

        const orderItems = await prisma.orderItem.findMany({
            where: { order_id },
            include: { product: true }
        });

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