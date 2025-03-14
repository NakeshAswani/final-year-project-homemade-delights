import dotenv from "dotenv";
dotenv.config();
import cloudinary from "@/app/lib/cloudinary";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
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
        const token = request.headers.get('token');

        const formData = await request.formData();
        const user_id = Number(formData.get('user_id')) as number;
        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const image = formData.get('image') as File | null;

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

        if (user.role !== "SELLER" || !user.is_active) {
            return NextResponse.json({
                status: 403,
                error: "Forbidden: you cannot add categories"
            });
        }

        if (!image) {
            return NextResponse.json({
                status: 400,
                error: "Image file is required"
            });
        }

        const buffer = Buffer.from(await image.arrayBuffer());
        const upload = await new Promise<any>((resolve, reject) => {
            cloudinary.uploader.upload_stream({ resource_type: "image" }, (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }).end(buffer);
        });

        const upload_url = cloudinary.url(upload.public_id, { transformation: { quality: "auto", fetch_format: "auto" } });

        await prisma.category.create({
            data: { user_id, name, description, image: upload_url }
        });

        return NextResponse.json({
            status: 201,
            message: "Category added successfully"
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
        const id = Number(request.nextUrl.searchParams.get('id'));

        if (id) {
            const token = request.headers.get('token');

            const category = await prisma.category.findUnique({
                where: { id }
            });

            if (!category) {
                return NextResponse.json({
                    status: 404,
                    error: "Category not found"
                });
            }

            const tokenResponse = await token_verification(token, category.user_id);
            if (tokenResponse) return tokenResponse;

            return NextResponse.json({
                status: 200,
                message: "Category Found",
                data: category
            });
        }
        else {
            const categories = await prisma.category.findMany();

            return NextResponse.json({
                status: 200,
                message: "Categories Found",
                data: categories
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

        const formData = await request.formData();
        const user_id = Number(formData.get('user_id')) as number;
        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const image = formData.get('image') as File | null;
        
        const tokenResponse = await token_verification(token, user_id);
        if (tokenResponse) return tokenResponse;

        const category = await prisma.category.findUnique({
            where: { id }
        });

        if (!category) {
            return NextResponse.json({
                status: 404,
                error: "Category not found"
            });
        }

        if (!image) {
            const imageUrl = category.image;
            await prisma.category.update({
                where: { id },
                data: { user_id: user_id || category.user_id, name: name || category.name, description: description || category.description, image: imageUrl }
            });
        }
        else {
            if (category.image) {
                const publicId = category.image.split('/').pop()?.split('.')[0];
                if (publicId) {
                    await cloudinary.uploader.destroy(publicId);
                }
            }

            const buffer = Buffer.from(await image.arrayBuffer());
            const upload = await new Promise<any>((resolve, reject) => {
                cloudinary.uploader.upload_stream({ resource_type: "image" }, (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }).end(buffer);
            });

            const upload_url = cloudinary.url(upload.public_id, { transformation: { quality: "auto", fetch_format: "auto" } });

            await prisma.category.update({
                where: { id },
                data: { user_id: user_id || category.user_id, name: name || category.name, description: description || category.description, image: upload_url }
            });
        }

        return NextResponse.json({
            status: 200,
            message: "Category updated successfully"
        });
    }
    catch (error: any) {
        return NextResponse.json({
            status: 500,
            error: error.message
        });
    }
};