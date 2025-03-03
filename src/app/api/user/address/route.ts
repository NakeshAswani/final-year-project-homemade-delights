import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export const POST = async (request: NextRequest) => {
    try {
        const user_id = Number(request.nextUrl.searchParams.get('user_id'));

        const { address, city, state, country, pincode } = await request.json() as { address: string, city: string, state: string, country: string, pincode: number };

        const user = await prisma.user.findUnique({
            where: { id: user_id }
        });

        if (!user) {
            return NextResponse.json({
                status: 404,
                error: "User not found"
            });
        }

        if (!user.is_active) {
            return NextResponse.json({
                status: 400,
                error: "User is not active"
            });
        }

        await prisma.address.create({
            data: { user_id, address, city, state, country, pincode }
        });

        return NextResponse.json({
            status: 201,
            message: "Address added successfully"
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
        const user_id = Number(request.nextUrl.searchParams.get('user_id'));

        const address = await prisma.address.findMany({
            where: { user_id }
        });

        return NextResponse.json({
            status: 200,
            message: "Address found",
            address
        });
    }
    catch (error: any) {
        return NextResponse.json({
            status: 500,
            error: error.message
        });
    }
}

export const PUT = async (request: NextRequest) => {
    try {
        const { id, address, city, state, country, pincode } = await request.json() as { id: number, address: string, city: string, state: string, country: string, pincode: number };

        const addressData = await prisma.address.findUnique({
            where: { id }
        });

        if (!addressData) {
            return NextResponse.json({
                status: 404,
                error: "Address not found"
            });
        }

        await prisma.address.update({
            where: { id },
            data: { address: address || addressData.address, city: city || addressData.city, state: state || addressData.state, country: country || addressData.country, pincode: pincode || addressData.pincode }
        });

        return NextResponse.json({
            status: 200,
            message: "Address updated successfully"
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
        const id = Number(request.nextUrl.searchParams.get('id'));

        const address = await prisma.address.findUnique({
            where: { id }
        });

        if (!address) {
            return NextResponse.json({
                status: 404,
                error: "Address not found"
            });
        }

        await prisma.address.delete({
            where: { id }
        });

        return NextResponse.json({
            status: 200,
            message: "Address deleted successfully"
        });
    }
    catch (error: any) {
        return NextResponse.json({
            status: 500,
            error: error.message
        });
    }
}