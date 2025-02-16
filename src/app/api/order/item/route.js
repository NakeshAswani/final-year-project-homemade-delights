import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export const GET = async (request) => {
    try {
        const order_id = await Number(request.nextUrl.searchParams.get("order_id"));

        const orderItems = await prisma.orderItem.findMany({ where: { order_id }, include: { product: true } });

        return NextResponse.json(orderItems, { status: 200 });
    }
    catch (error) {
        return NextResponse.json({ status: 500, error: error.message });
    }
}