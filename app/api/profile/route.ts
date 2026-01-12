import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyJWT } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const payload = await verifyJWT(token);

    if (!payload || !payload.role) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { id, role } = payload as { id: number; role: string };

    let user;
    if (role === 'admin') {
      user = await prisma.admin.findUnique({
        where: { id },
        select: {
          id: true,
          fullName: true,
          Email: true,
          userName: true,
          updationDate: true,
        },
      });
    } else if (role === 'employee') {
      user = await prisma.employee.findUnique({
        where: { id },
        select: {
          id: true,
          employeeId: true,
          fullName: true,
          email: true,
          mobileNumber: true,
          status: true,
          regDate: true,
          updationDate: true,
        },
      });
    } else {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user, role });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const payload = await verifyJWT(token);

    if (!payload || !payload.role) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { id, role } = payload as { id: number; role: string };
    const body = await request.json();

    let updatedUser;
    if (role === 'admin') {
      const { fullName, Email, userName } = body;
      updatedUser = await prisma.admin.update({
        where: { id },
        data: {
          fullName,
          Email,
          userName,
        },
      });
    } else if (role === 'employee') {
      const { fullName, email, mobileNumber } = body;
      updatedUser = await prisma.employee.update({
        where: { id },
        data: {
          fullName,
          email,
          mobileNumber,
        },
      });
    } else {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    return NextResponse.json({ user: updatedUser, role });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}