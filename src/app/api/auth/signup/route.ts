import { handleResponse } from "@/lib/utils";
import { PrismaClient, Role } from "@prisma/client";
import { NextRequest } from "next/server";

const prisma = new PrismaClient();

export const POST = async (request: NextRequest) => {
    try {
        const { name, email, password, role } = await request.json() as { name: string, email: string, password: string, role: Role };

        await prisma.user.create({
            data: { name, email, password, role }
        });
        return handleResponse(200, "User created successfully");
    }
    catch (error: any) {
        return handleResponse(500, error.message);
    }
};