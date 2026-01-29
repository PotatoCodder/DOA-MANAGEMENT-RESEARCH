import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { signJWT } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    const { userName, password, fullName, Email } = await request.json();

    if (!userName || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    const existingAdmin = await prisma.admin.findUnique({
      where: { userName },
    });

    if (existingAdmin) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
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

    return NextResponse.json({ token });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}