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
        const user_id = Number(request.nextUrl.searchParams.get('user_id'));
        const token = request.headers.get('token');
        const tokenResponse = await token_verification(token, user_id);
        if (tokenResponse) return tokenResponse;

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
        const token = request.headers.get('token');
        const tokenResponse = await token_verification(token, user_id);
        if (tokenResponse) return tokenResponse;

        const user = await prisma.user.findUnique({
            where: { id: user_id }
        });

        if (!user) {
            return NextResponse.json({
                status: 404,
                error: "User not found"
            });
        }

        const address = await prisma.address.findMany({
            where: { user_id }
        });

        if (address.length === 0) {
            return NextResponse.json({
                status: 404,
                error: "Address not found"
            });
        }

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
        const token = request.headers.get('token');
        
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
        
        const tokenResponse = await token_verification(token, addressData.user_id);
        if (tokenResponse) return tokenResponse;

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
        const token = request.headers.get('token');
        
        const address = await prisma.address.findUnique({
            where: { id }
        });
        
        if (!address) {
            return NextResponse.json({
                status: 404,
                error: "Address not found"
            });
        }
        
        const tokenResponse = await token_verification(token, address.user_id);
        if (tokenResponse) return tokenResponse;
        
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