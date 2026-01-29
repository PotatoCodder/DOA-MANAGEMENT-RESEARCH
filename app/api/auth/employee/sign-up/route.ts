import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { signJWT } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    const { employeeId, fullName, email, mobileNumber, password } = await request.json();

    if (!employeeId || !password || !email) {
      return NextResponse.json({ error: 'Employee ID, email, and password are required' }, { status: 400 });
    }

    const existingEmployee = await prisma.employee.findFirst({
      where: {
        OR: [
          { employeeId },
          { email },
        ],
      },
    });

    if (existingEmployee) {
      return NextResponse.json({ error: 'Employee ID or email already exists' }, { status: 409 });
    }

    // Store password in plain text (unhashed)
    const employee = await prisma.employee.create({
      data: {
        employeeId,
        fullName,
        email,
        mobileNumber,
        password: password, // Store as plain text
        status: true, // assuming active
      },
    });

    const token = await signJWT({ id: employee.id, employeeId: employee.employeeId, email: employee.email, role: 'employee' });

    return NextResponse.json({ token });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}