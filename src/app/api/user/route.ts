import { PrismaClient, Role } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export const GET = async (request: NextRequest) => {
    try {
        const id = Number(request.nextUrl.searchParams.get('id'));

        if (id) {
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