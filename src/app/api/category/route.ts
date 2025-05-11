import dotenv from "dotenv";
dotenv.config();
import cloudinary from "@/lib/cloudinary";
import { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import { handleResponse, tokenVerification, userPublicFields } from "@/lib/utils";

const prisma = new PrismaClient();

/**
 * Create a new category (POST)
 */
export const POST = async (request: NextRequest) => {
    try {
        const token = request.headers.get('token');
        const formData = await request.formData();
        const user_id = Number(formData.get('user_id'));
        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const image = formData.get('image') as File | null;

        const tokenResponse = await tokenVerification(token, user_id);
        if (tokenResponse) return tokenResponse;

        const user = await prisma.user.findUnique({ where: { id: user_id } });
        if (!user) return handleResponse(404, "User not found");
        if (user.role !== "SELLER" || !user.is_active) return handleResponse(403, "Forbidden: You cannot add categories");

        if (!image) return handleResponse(400, "Image file is required");

        const buffer = Buffer.from(await image.arrayBuffer());
        const upload = await new Promise<any>((resolve, reject) => {
            cloudinary.uploader.upload_stream({ resource_type: "image" }, (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }).end(buffer);
        });

        const upload_url = cloudinary.url(upload.public_id, { transformation: { quality: "auto", fetch_format: "auto" } });

        await prisma.category.create({ data: { user_id, name, description, image: upload_url } });

        return handleResponse(201, "Category added successfully");
    } catch (error: any) {
        return handleResponse(500, error.message);
    }
};

/**
 * Get category/categories (GET)
 */
export const GET = async (request: NextRequest) => {
    try {
        const id = Number(request.nextUrl.searchParams.get('id'));

        if (id) {
            const category = await prisma.category.findUnique({
                where: { id },
                include: { user: { select: userPublicFields } }
            });
            if (!category) return handleResponse(404, "Category not found");
            return handleResponse(200, "Category found", category);
        } else {
            const categories = await prisma.category.findMany();
            return handleResponse(200, "Categories found", categories);
        }
    } catch (error: any) {
        return handleResponse(500, error.message);
    }
};

/**
 * Update category (PUT)
 */
export const PUT = async (request: NextRequest) => {
    try {
        const id = Number(request.nextUrl.searchParams.get('id'));
        const token = request.headers.get('token');
        const formData = await request.formData();
        const user_id = Number(formData.get('user_id'));
        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const image = formData.get('image') as File | null;

        const tokenResponse = await tokenVerification(token, user_id);
        if (tokenResponse) return tokenResponse;

        const category = await prisma.category.findUnique({ where: { id } });
        if (!category) return handleResponse(404, "Category not found");

        let imageUrl = category.image;
        if (image) {
            // Delete old image from Cloudinary
            const publicId = category.image.split('/').pop()?.split('.')[0];
            if (publicId) await cloudinary.uploader.destroy(publicId);

            // Upload new image
            const buffer = Buffer.from(await image.arrayBuffer());
            const upload = await new Promise<any>((resolve, reject) => {
                cloudinary.uploader.upload_stream({ resource_type: "image" }, (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }).end(buffer);
            });

            imageUrl = cloudinary.url(upload.public_id, { transformation: { quality: "auto", fetch_format: "auto" } });
        }

        await prisma.category.update({
            where: { id },
            data: {
                user_id: user_id || category.user_id,
                name: name || category.name,
                description: description || category.description,
                image: imageUrl
            }
        });

        return handleResponse(200, "Category updated successfully");
    } catch (error: any) {
        return handleResponse(500, error.message);
    }
};