import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { signJWT } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    const { userName, password, fullName, Email } = await request.json();

    if (!userName || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    const existingAdmin = await prisma.admin.findFirst({
      where: {
        OR: [
          { userName: { equals: userName.trim(), mode: 'insensitive' } },
          { Email: { equals: Email ? Email.trim() : undefined, mode: 'insensitive' } },
        ],
      },
    });

    if (existingAdmin) {
      const error = existingAdmin.userName === userName 
        ? 'Username already exists' 
        : 'Email already exists';
      return NextResponse.json({ error }, { status: 409 });
    }

    // Store password in plain text (unhashed)
    const admin = await prisma.admin.create({
      data: {
        userName,
        password: password, // Store as plain text
        fullName,
        Email,
      },
    });

    const token = await signJWT({ id: admin.id, userName: admin.userName, role: 'admin' });

    return NextResponse.json({ token, id: admin.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}