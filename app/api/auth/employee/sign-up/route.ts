import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { signJWT } from '@/lib/jwt';
import { ratelimit } from '@/lib/ratelimit';
import { z } from 'zod';

const signUpSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  fullName: z.string().optional(),
  email: z.string().email('Invalid email address'),
  mobileNumber: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';
    
    const { success } = await ratelimit.limit(ip);
    if (!success) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const body = await request.json();
    const parsed = signUpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { employeeId, fullName, email, mobileNumber, password } = parsed.data;

    const existingEmployee = await prisma.employee.findFirst({
      where: {
        OR: [
          { employeeId: { equals: employeeId.trim(), mode: 'insensitive' } },
          { email: { equals: email.trim(), mode: 'insensitive' } },
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

    return NextResponse.json({ token, id: employee.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}