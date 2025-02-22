import cloudinary from "@/app/lib/cloudinary";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export const POST = async (request: NextRequest) => {
    try {
        const formData = await request.formData();
        const category_id = Number(formData.get("category_id"));
        const user_id = Number(formData.get("user_id"));
        const name = formData.get("name") as string;
        const description = formData.get("description") as string;
        const price = Number(formData.get("price"));
        const discounted_price = Number(formData.get("discounted_price"));
        const stock = Number(formData.get("stock"));
        const image = formData.get("image") as File;

        if (!image) {
            return NextResponse.json({
                status: 400,
                error: "Image file is required"
            });
        }

        const user = await prisma.user.findUnique({
            where: { id: user_id }
        });

        if (!user) {
            return NextResponse.json({
                status: 404,
                error: "User not found"
            });
        }

        if (user.role == "SELLER" && user.is_active) {
            const buffer = Buffer.from(await image.arrayBuffer());
            const upload = await new Promise<any>((resolve, reject) => {
                cloudinary.uploader.upload_stream({ resource_type: "image" }, (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }).end(buffer);
            });

            const upload_url = cloudinary.url(upload.public_id, { transformation: { quality: "auto", fetch_format: "auto" } });

            await prisma.product.create({
                data: { category_id, user_id, name, description, price, discounted_price, stock, image: upload_url }
            });

            return NextResponse.json({
                status: 201,
                message: "Product added successfully"
            });
        }
        else {
            return NextResponse.json({
                status: 400,
                message: "You cannot add product"
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

export const GET = async (request: NextRequest) => {
    try {
        const id = Number(request.nextUrl.searchParams.get('id'));

        if (id) {
            const product = await prisma.product.findUnique({
                where: { id, user: { is_active: true } }
            });

            if (!product) {
                return NextResponse.json({
                    status: 404,
                    error: "Product not found"
                });
            }

            return NextResponse.json({
                status: 200,
                message: "Product Found",
                data: product
            });
        }
        else {
            const products = await prisma.product.findMany({
                where: { user: { is_active: true } }
            });

            return NextResponse.json({
                status: 200,
                message: "Products Found",
                data: products
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

        const formData = await request.formData();
        const category_id = Number(formData.get("category_id"));
        const user_id = Number(formData.get("user_id"));
        const name = formData.get("name") as string;
        const description = formData.get("description") as string;
        const price = Number(formData.get("price"));
        const discounted_price = Number(formData.get("discounted_price"));
        const stock = Number(formData.get("stock"));
        const image = formData.get("image") as File | null;

        const product = await prisma.product.findUnique({
            where: { id, user: { is_active: true } }
        });

        if (!product) {
            return NextResponse.json({
                status: 404,
                error: "Product not found"
            });
        }

        if (!image) {
            const imageUrl = product.image;
            await prisma.product.update({
                where: { id },
                data: { category_id: category_id || product.category_id, user_id: user_id || product.user_id, name: name || product.name, description: description || product.description, price: price || product.price, discounted_price: discounted_price || product.discounted_price, stock: stock || product.stock, image: imageUrl }
            });
        }
        else {
            if (product.image) {
                const publicId = product.image.split('/').pop()?.split('.')[0];
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

            await prisma.product.update({
                where: { id },
                data: { category_id: category_id || product.category_id, user_id: user_id || product.user_id, name: name || product.name, description: description || product.description, price: price || product.price, discounted_price: discounted_price || product.discounted_price, stock: stock || product.stock, image: upload_url }
            });
        }

        return NextResponse.json({
            status: 200,
            message: "Product updated successfully"
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

        const product = await prisma.product.findUnique({
            where: { id, user: { is_active: true } }
        });

        if (!product) {
            return NextResponse.json({
                status: 404,
                error: "Product not found"
            });
        }

        if (product.image) {
            const publicId = product.image.split('/').pop()?.split('.')[0];
            if (publicId) {
                await cloudinary.uploader.destroy(publicId);
            }
        }

        await prisma.product.delete({
            where: { id }
        });

        return NextResponse.json({
            status: 200,
            message: "Product deleted successfully"
        });
    }
    catch (error: any) {
        return NextResponse.json({
            status: 500,
            error: error.message
        });
    }
}
