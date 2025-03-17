import dotenv from "dotenv";
dotenv.config();
import { PrismaClient, Role } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

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
        const id = Number(request.nextUrl.searchParams.get('id'));

        if (id) {
            const token = request.headers.get('token');
            const tokenResponse = await token_verification(token, id);
            if (tokenResponse) return tokenResponse;

            const user = await prisma.user.findUnique({
                where: { id }
            });

            return NextResponse.json({
                status: 200,
                message: "User Found",
                data: user
            });
        }
        else {
            const users = await prisma.user.findMany({ include: { addresses: true } });

            return NextResponse.json({
                status: 200,
                message: "Users Found",
                data: users
            });
        }
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
        const id = Number(request.nextUrl.searchParams.get('id'));
        const token = request.headers.get('token');
        const tokenResponse = await token_verification(token, id);
        if (tokenResponse) return tokenResponse;

        const { name, email, role } = await request.json() as { name: string, email: string, role: Role };

        const user = await prisma.user.findUnique({
            where: { id }
        });

        if (!user) {
            return NextResponse.json({
                status: 404,
                error: "User not found"
            });
        }

        await prisma.user.update({
            where: { id },
            data: { name, email, role }
        });

        return NextResponse.json({
            status: 200,
            message: "User updated successfully"
        });
    }
    catch (error: any) {
        return NextResponse.json({
            status: 500,
            error: error.message
        });
    }
}

export const PATCH = async (request: NextRequest) => {
    try {
        const id = Number(request.nextUrl.searchParams.get('id'));
        const token = request.headers.get('token');
        const tokenResponse = await token_verification(token, id);
        if (tokenResponse) return tokenResponse;

        const { password } = await request.json() as { password: string };

        const user = await prisma.user.findUnique({
            where: { id }
        });

        if (!user) {
            return NextResponse.json({
                status: 404,
                error: "User not found"
            });
        }

        await prisma.user.update({
            where: { id },
            data: { password }
        });

        return NextResponse.json({
            status: 200,
            message: "Password updated successfully"
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
        const tokenResponse = await token_verification(token, id);
        if (tokenResponse) return tokenResponse;

        const user = await prisma.user.findUnique({
            where: { id }
        });

        if (!user) {
            return NextResponse.json({
                status: 404,
                error: "User not found"
            });
        }

        await prisma.user.update({
            where: { id },
            data: { is_active: false }
        });

        return NextResponse.json({
            status: 200,
            message: "User deactivated successfully"
        });
    }
    catch (error: any) {
        return NextResponse.json({
            status: 500,
            error: error.message
        });
    }
}