import dotenv from "dotenv";
dotenv.config();
import cloudinary from "@/lib/cloudinary";
import { PrismaClient } from "@prisma/client";
import { NextRequest } from "next/server";
import { handleResponse, tokenVerification, userPublicFields } from "@/lib/utils";

const prisma = new PrismaClient();

// **POST - Add Product**
export const POST = async (request: NextRequest) => {
    try {
        const token = request.headers.get('token');
        const formData = await request.formData();

        const category_id = Number(formData.get("category_id"));
        const address_id = Number(formData.get("address_id"));
        const user_id = Number(formData.get("user_id"));
        const name = formData.get("name") as string;
        const description = formData.get("description") as string;
        const price = Number(formData.get("price"));
        const discounted_price = Number(formData.get("discounted_price"));
        const stock = Number(formData.get("stock"));
        const image = formData.get("image") as File;

        const tokenResponse = await tokenVerification(token, user_id);
        if (tokenResponse) return tokenResponse;

        if (!image) return handleResponse(400, "Image file is required");

        const user = await prisma.user.findUnique({ where: { id: user_id } });
        if (!user) return handleResponse(404, "User not found");

        if (user.role !== "SELLER" || !user.is_active) {
            return handleResponse(400, "You cannot add a product");
        }

        const buffer = Buffer.from(await image.arrayBuffer());
        const upload = await new Promise<any>((resolve, reject) => {
            cloudinary.uploader.upload_stream({ resource_type: "image" }, (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }).end(buffer);
        });

        const upload_url = cloudinary.url(upload.public_id, { transformation: { quality: "auto", fetch_format: "auto" } });

        await prisma.product.create({
            data: { category_id, address_id, user_id, name, description, price, discounted_price, stock, image: upload_url }
        });

        return handleResponse(201, "Product added successfully");
    } catch (error: any) {
        return handleResponse(500, error.message);
    }
};

export const GET = async (request: NextRequest) => {
    try {
        const id = Number(request.nextUrl.searchParams.get('id'));
        const userId = Number(request.nextUrl.searchParams.get('user_id'));

        const baseWhere = {
            user: {
                is_active: true,
                ...(userId && { id: userId })
            }
        };

        const productData = id
            ? await prisma.product.findUnique({
                where: {
                    id,
                    ...baseWhere
                },
                include: { user: { select: userPublicFields },  address: true }
            })
            : await prisma.product.findMany({
                where: baseWhere,
                include: {
                    user: { select: userPublicFields },
                    category: true,
                    address: true,
                }
            });

        if (!productData) return handleResponse(404, id ? "Product not found" : "No products found");

        return handleResponse(200, id ? "Product Found" : "Products Found", productData);
    } catch (error: any) {
        return handleResponse(500, error.message);
    }
};

// **PUT - Update Product**
export const PUT = async (request: NextRequest) => {
    try {
        const id = Number(request.nextUrl.searchParams.get('id'));
        const token = request.headers.get('token');
        const formData = await request.formData();

        const category_id = Number(formData.get("category_id"));
        const user_id = Number(formData.get("user_id"));
        const name = formData.get("name") as string;
        const description = formData.get("description") as string;
        const price = Number(formData.get("price"));
        const discounted_price = Number(formData.get("discounted_price"));
        const stock = Number(formData.get("stock"));
        const image = formData.get("image") as File | null;

        const tokenResponse = await tokenVerification(token, user_id);
        if (tokenResponse) return tokenResponse;

        const product = await prisma.product.findUnique({ where: { id, user: { is_active: true } } });
        if (!product) return handleResponse(404, "Product not found");

        let imageUrl = product.image;
        if (image) {
            if (product.image) {
                const publicId = product.image.split('/').pop()?.split('.')[0];
                if (publicId) await cloudinary.uploader.destroy(publicId);
            }

            const buffer = Buffer.from(await image.arrayBuffer());
            const upload = await new Promise<any>((resolve, reject) => {
                cloudinary.uploader.upload_stream({ resource_type: "image" }, (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }).end(buffer);
            });

            imageUrl = cloudinary.url(upload.public_id, { transformation: { quality: "auto", fetch_format: "auto" } });
        }

        await prisma.product.update({
            where: { id },
            data: {
                category_id: category_id || product.category_id,
                user_id: user_id || product.user_id,
                name: name || product.name,
                description: description || product.description,
                price: price || product.price,
                discounted_price: discounted_price || product.discounted_price,
                stock: stock || product.stock,
                image: imageUrl,
            }
        });

        return handleResponse(200, "Product updated successfully");
    } catch (error: any) {
        return handleResponse(500, error.message);
    }
};

// **DELETE - Remove Product**
export const DELETE = async (request: NextRequest) => {
    try {
        const id = Number(request.nextUrl.searchParams.get('id'));
        const token = request.headers.get('token');

        const product = await prisma.product.findUnique({ where: { id, user: { is_active: true } } });
        if (!product) return handleResponse(404, "Product not found");

        const tokenResponse = await tokenVerification(token, product.user_id);
        if (tokenResponse) return tokenResponse;

        if (product.image) {
            const publicId = product.image.split('/').pop()?.split('.')[0];
            if (publicId) await cloudinary.uploader.destroy(publicId);
        }

        await prisma.product.delete({ where: { id } });

        return handleResponse(200, "Product deleted successfully");
    } catch (error: any) {
        return handleResponse(500, error.message);
    }
};