import { handleResponse, hashPassword } from "@/lib/utils";
import { PrismaClient, Role } from "@prisma/client";
import { NextRequest } from "next/server";

const prisma = new PrismaClient();

export const POST = async (request: NextRequest) => {
    try {
        const { name, email, password, role, addresses } = await request.json() as {
            name: string,
            email: string,
            password: string,
            role: Role,
            addresses?: Array<{
                city: string
                state: string
                country: string
                pincode: string
                address: string
            }>
        };

        // Validate required fields
        if (!name || !email || !password) {
            return handleResponse(400, "Missing required fields");
        }

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return handleResponse(409, "Email already exists. Please use a different email address.");
        }

        const hashedPassword = await hashPassword(password);

        // Create user with nested addresses
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
                addresses: {
                    create: addresses?.map(addr => ({
                        city: addr.city,
                        state: addr.state,
                        pincode: Number(addr.pincode),
                        address: addr.address,
                        country: addr.country
                    })) || []
                }
            },
            include: { addresses: true }
        });

        return handleResponse(201, "User created successfully", {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email
        });
    } catch (error: any) {
        console.error("Registration error:", error);
        return handleResponse(500, error.message || "Internal server error");
    }
};