import { PrismaClient, Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export const POST = async (request: NextRequest) => {
    try {
        const { name, email, password, role } = await request.json() as { name: string, email: string, password: string, role: Role };

        await prisma.user.create({
            data: { name, email, password, role }
        });

        return NextResponse.json({
            status: 201,
            message: "User created successfully"
        });
    }
    catch (error: any) {
        return NextResponse.json({
            status: 500,
            error: error.message
        });
    }
}