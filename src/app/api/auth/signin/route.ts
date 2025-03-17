import dotenv from "dotenv";
dotenv.config();
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export const POST = async (request: NextRequest) => {
    try {
        const { email, password } = await request.json() as { email: string, password: string };

        const user = await prisma.user.findFirst({
            where: { email, password }
        });

        if (!user) {
            return NextResponse.json({
                status: 404,
                error: "User not found"
            });
        }

        if (!user.is_active) {
            return NextResponse.json({
                status: 403,
                message: "User is deactivate do you want to activate it?",
                data: user
            });
        }

        if (!process.env.JWT_TOKEN_KEY) {
            throw new Error("JWT_TOKEN_KEY is not defined in environment variables");
        }
        const token = jwt.sign(user, process.env.JWT_TOKEN_KEY, { expiresIn: "30d" });

        return NextResponse.json({
            status: 200,
            message: "User logged in successfully",
            data: user,
            token: token
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

        let user = await prisma.user.findUnique({
            where: { id }
        });

        if (!user) {
            return NextResponse.json({
                status: 404,
                error: "User not found"
            });
        }

        user = await prisma.user.update({
            where: { id },
            data: { is_active: true }
        });

        if (!process.env.JWT_TOKEN_KEY) {
            throw new Error("JWT_TOKEN_KEY is not defined in environment variables");
        }

        const token = jwt.sign(user, process.env.JWT_TOKEN_KEY, { expiresIn: "30d" });

        return NextResponse.json({
            status: 200,
            message: "User Activated successfully",
            data: user,
            token: token
        });
    }
    catch (error: any) {
        return NextResponse.json({
            status: 500,
            error: error.message
        });
    }
}