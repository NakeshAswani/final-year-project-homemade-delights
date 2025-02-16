import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export const POST = async (request) => {
    try {
        const { name, email, password, role } = await request.json();

        await prisma.user.create({ data: { name, email, password, role } });

        return NextResponse.json({ status: 201, "message": "User created successfully" });
    }
    catch (error) {
        return NextResponse.json({ status: 500, error: error.message });
    }
}

export const GET = async (request) => {
    try {
        const id = await Number(request.nextUrl.searchParams.get('id'));

        if (id) {
            const user = await prisma.user.findUnique({ where: { id } });
            return NextResponse.json(user, { status: 200 });
        }
        else {
            const users = await prisma.user.findMany();
            return NextResponse.json(users, { status: 200 });
        }
    }
    catch (error) {
        return NextResponse.json({ status: 500, error: error.message });
    }
}

export const PUT = async (request) => {
    try {
        const id = await Number(request.nextUrl.searchParams.get('id'));
        const { name, email, role } = await request.json();
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            return NextResponse.json({ status: 404, error: "User not found" });
        }
        await prisma.user.update({ where: { id }, data: { name, email, role } });
        return NextResponse.json({ status: 200, "message": "User updated successfully" });
    }
    catch (error) {
        return NextResponse.json({ status: 500, error: error.message });
    }
}

export const PATCH = async (request) => {
    try {
        const id = await Number(request.nextUrl.searchParams.get('id'));
        const { password } = await request.json();
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            return NextResponse.json({ status: 404, error: "User not found" });
        }
        await prisma.user.update({ where: { id }, data: { password } });
        return NextResponse.json({ status: 200, "message": "Password updated successfully" });
    }
    catch (error) {
        return NextResponse.json({ status: 500, error: error.message });
    }
}

export const DELETE = async (request) => {
    try {
        const id = await Number(request.nextUrl.searchParams.get('id'));
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            return NextResponse.json({ status: 404, error: "User not found" });
        }
        await prisma.user.delete({ where: { id } });
        return NextResponse.json({ status: 200, "message": "User deleted successfully" });
    }
    catch (error) {
        return NextResponse.json({ status: 500, error: error.message });
    }
}