import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword } from '@/lib/hash';
import { signJWT } from '@/lib/jwt';
import { ratelimit } from '@/lib/ratelimit';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().min(1, 'Email or Employee ID is required'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';
    
    const { success } = await ratelimit.limit(ip);
    if (!success) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { email, password } = parsed.data;

    const employee = await prisma.employee.findFirst({
      where: {
        OR: [
          { email: { equals: email.trim(), mode: 'insensitive' } },
          { employeeId: { equals: email.trim(), mode: 'insensitive' } },
        ],
      },
    });

    if (!employee) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    let isValid = false;
    if (employee.password.startsWith('$2b$')) {
      isValid = await verifyPassword(password, employee.password);
    } else {
      isValid = password === employee.password;
    }

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = await signJWT({ id: employee.id, employeeId: employee.employeeId, email: employee.email, role: 'employee' });

    return NextResponse.json({ token, id: employee.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}