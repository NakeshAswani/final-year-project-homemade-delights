import cloudinary from "@/app/lib/cloudinary";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const POST = async (request: NextRequest) => {
    try {
        const formData = await request.formData();
        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const image = formData.get('image') as File | null;

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
            data: { name, description, image: upload_url }
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
            const category = await prisma.category.findUnique({
                where: { id }
            });

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

        const formData = await request.formData();
        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const image = formData.get('image') as File | null;

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
                data: { name: name || category.name, description: description || category.description, image: imageUrl }
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
                data: { name: name || category.name, description: description || category.description, image: upload_url }
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