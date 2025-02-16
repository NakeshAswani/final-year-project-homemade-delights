import cloudinary from "@/app/lib/cloudinary";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export const POST = async (request) => {
    try {
        const formData = await request.formData();
        const category_id = Number(formData.get("category_id"))
        const user_id = Number(formData.get("user_id"))
        const name = formData.get("name")
        const description = formData.get("description")
        const price = Number(formData.get("price"))
        const discounted_price = Number(formData.get("discounted_price"))
        const image = formData.get("image")

        if (!image) {
            return NextResponse.json({ status: 400, error: "Image file is required" });
        }

        const buffer = Buffer.from(await image.arrayBuffer());
        const upload = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({ resource_type: "image" }, (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }).end(buffer);
        });

        await prisma.product.create({ data: { category_id, user_id, name, description, price, discounted_price, image: upload.secure_url } });

        return NextResponse.json({ status: 201, "message": "Product created successfully" });
    }
    catch (error) {
        return NextResponse.json({ status: 500, error: error.message });
    }
}

export const GET = async (request) => {
    try {
        const id = await Number(request.nextUrl.searchParams.get('id'));

        if (id) {
            const product = await prisma.product.findUnique({ where: { id } });

            return NextResponse.json(product, { status: 200 });
        }
        else {
            const products = await prisma.product.findMany();

            return NextResponse.json(products, { status: 200 });
        }
    }
    catch (error) {
        return NextResponse.json({ status: 500, error: error.message });
    }
}

export const PUT = async (request) => {
    try {
        const id = await Number(request.nextUrl.searchParams.get('id'));
        const formData = await request.formData();
        const category_id = Number(formData.get("category_id"));
        const user_id = Number(formData.get("user_id"));
        const name = formData.get("name");
        const description = formData.get("description");
        const price = Number(formData.get("price"));
        const discounted_price = Number(formData.get("discounted_price"));
        let image = formData.get("image");

        const product = await prisma.product.findUnique({ where: { id } });
        if (!product) {
            return NextResponse.json({ status: 404, error: "Product not found" });
        }

        if (!image) {
            image = product.image;
            await prisma.product.update({ where: { id }, data: { category_id: category_id || product.category_id, user_id: user_id || product.user_id, name: name || product.name, description: description || product.description, price: price || product.price, discounted_price: discounted_price || product.discounted_price, image } });
        }
        else {
            if (product.image) {
                const publicId = product.image.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(publicId);
            }

            const buffer = Buffer.from(await image.arrayBuffer());
            const upload = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream({ resource_type: "image" }, (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }).end(buffer);
            });

            await prisma.product.update({ where: { id }, data: { category_id: category_id || product.category_id, user_id: user_id || product.user_id, name: name || product.name, description: description || product.description, price: price || product.price, discounted_price: discounted_price || product.discounted_price, image: upload.secure_url } });
        }

        return NextResponse.json({ status: 200, message: "Product updated successfully" });
    }
    catch (error) {
        return NextResponse.json({ status: 500, error: error.message });
    }
}

export const DELETE = async (request) => {
    try {
        const id = await Number(request.nextUrl.searchParams.get('id'));
        const product = await prisma.product.findUnique({ where: { id } });
        if (!product) {
            return NextResponse.json({ status: 404, error: "Product not found" });
        }

        if (product.image) {
            const publicId = product.image.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(publicId);
        }

        await prisma.product.delete({ where: { id } });
        return NextResponse.json({ status: 200, message: "Product deleted successfully" });
    }
    catch (error) {
        return NextResponse.json({ status: 500, error: error.message });
    }
}