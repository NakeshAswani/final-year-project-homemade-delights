import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

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

        return NextResponse.json({
            status: 200,
            message: "User logged in successfully",
            data: user
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
            data: { is_active: true }
        });

        return NextResponse.json({
            status: 200,
            message: "User Activated successfully"
        });
    }
    catch (error: any) {
        return NextResponse.json({
            status: 500,
            error: error.message
        });
    }
}