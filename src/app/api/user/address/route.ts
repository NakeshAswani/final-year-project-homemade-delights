import dotenv from "dotenv";
dotenv.config();
import { PrismaClient } from "@prisma/client";
import { NextRequest } from "next/server";
import { handleResponse, tokenVerification } from "@/lib/utils";

const prisma = new PrismaClient();

// **POST - Add Address**
export const POST = async (request: NextRequest) => {
    try {
        const user_id = Number(request.nextUrl.searchParams.get('user_id'));
        const token = request.headers.get('token');
        const tokenResponse = await tokenVerification(token, user_id);
        if (tokenResponse) return tokenResponse;

        const { address, city, state, country, pincode } = await request.json();

        const user = await prisma.user.findUnique({ where: { id: user_id } });
        if (!user) return handleResponse(404, "User not found");
        if (!user.is_active) return handleResponse(400, "User is not active");

        await prisma.address.create({ data: { user_id, address, city, state, country, pincode } });
        return handleResponse(201, "Address added successfully");
    } catch (error: any) {
        return handleResponse(500, error.message);
    }
};

// **GET - Fetch Addresses**
export const GET = async (request: NextRequest) => {
    try {
        const user_id = Number(request.nextUrl.searchParams.get('user_id'));
        const token = request.headers.get('token');
        const tokenResponse = await tokenVerification(token, user_id);
        if (tokenResponse) return tokenResponse;

        const user = await prisma.user.findUnique({ where: { id: user_id } });
        if (!user) return handleResponse(404, "User not found");

        const addresses = await prisma.address.findMany({ where: { user_id } });
        if (addresses.length === 0) return handleResponse(404, "Address not found");

        return handleResponse(200, "Address found", addresses);
    } catch (error: any) {
        return handleResponse(500, error.message);
    }
};

// **PUT - Update Address**
export const PUT = async (request: NextRequest) => {
    try {
        const token = request.headers.get('token');
        const { id, address, city, state, country, pincode } = await request.json();

        const addressData = await prisma.address.findUnique({ where: { id } });
        if (!addressData) return handleResponse(404, "Address not found");

        const tokenResponse = await tokenVerification(token, addressData.user_id);
        if (tokenResponse) return tokenResponse;

        await prisma.address.update({
            where: { id },
            data: {
                address: address || addressData.address,
                city: city || addressData.city,
                state: state || addressData.state,
                country: country || addressData.country,
                pincode: pincode || addressData.pincode
            }
        });

        return handleResponse(200, "Address updated successfully");
    } catch (error: any) {
        return handleResponse(500, error.message);
    }
};

// **DELETE - Remove Address**
export const DELETE = async (request: NextRequest) => {
    try {
        const id = Number(request.nextUrl.searchParams.get('id'));
        const token = request.headers.get('token');

        const address = await prisma.address.findUnique({ where: { id } });
        if (!address) return handleResponse(404, "Address not found");

        const tokenResponse = await tokenVerification(token, address.user_id);
        if (tokenResponse) return tokenResponse;

        await prisma.address.delete({ where: { id } });
        return handleResponse(200, "Address deleted successfully");
    } catch (error: any) {
        return handleResponse(500, error.message);
    }
};