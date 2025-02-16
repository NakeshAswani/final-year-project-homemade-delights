import cloudinary from "@/app/lib/cloudinary";
import { NextResponse } from "next/server";

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

export const POST = async (request) => {
    try {
        const formData = await request.formData();
        const name = formData.get('name');
        const description = formData.get('description');
        const image = formData.get('image');

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

        await prisma.category.create({ data: { name, description, image: upload.secure_url } });
        return NextResponse.json({ status: 201, "message": "Category created successfully" });
    }
    catch (error) {
        return NextResponse.json({ status: 500, error: error.message });
    }
}

export const GET = async (request) => {
    try {
        const id = await Number(request.nextUrl.searchParams.get('id'));
        if (id) {
            const category = await prisma.category.findUnique({ where: { id } });
            return NextResponse.json(category, { status: 200 });
        }
        else {
            const categories = await prisma.category.findMany();
            return NextResponse.json(categories, { status: 200 });
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
        const name = formData.get('name');
        const description = formData.get('description');
        let image = formData.get('image');


        const category = await prisma.category.findUnique({ where: { id } });
        if (!category) {
            return NextResponse.json({ status: 404, error: "Category not found" });
        }

        if (!image) {
            image = category.image;
            await prisma.category.update({ where: { id }, data: { name: name || category.name, description: description || category.description, image } });
        }
        else {
            if (category.image) {
                const publicId = category.image.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(publicId);
            }

            const buffer = Buffer.from(await image.arrayBuffer());
            const upload = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream({ resource_type: "image" }, (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }).end(buffer);
            });

            await prisma.category.update({ where: { id }, data: { name: name || category.name, description: description || category.description, image: upload.secure_url } });
        }

        return NextResponse.json({ status: 200, message: "Category updated successfully" });
    }
    catch (error) {
        return NextResponse.json({ status: 500, error: error.message });
    }
};

export const DELETE = async (request) => {
    try {
        const id = await Number(request.nextUrl.searchParams.get('id'));
        const category = await prisma.category.findUnique({ where: { id } });
        if (!category) {
            return NextResponse.json({ status: 404, error: "Category not found" });
        }

        if (category.image) {
            const publicId = category.image.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(publicId);
        }

        await prisma.category.delete({ where: { id } });
        return NextResponse.json({ status: 200, message: "Category deleted successfully" });
    }
    catch (error) {
        return NextResponse.json({ status: 500, error: error.message });
    }
}