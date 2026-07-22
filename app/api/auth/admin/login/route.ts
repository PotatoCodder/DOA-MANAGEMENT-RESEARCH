import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword } from '@/lib/hash';
import { signJWT } from '@/lib/jwt';
import { ratelimit } from '@/lib/ratelimit';
import { z } from 'zod';

const loginSchema = z.object({
  userName: z.string().min(1, 'Username is required'),
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

    const { userName, password } = parsed.data;

    const admin = await prisma.admin.findFirst({
      where: {
        OR: [
          { userName: { equals: userName.trim(), mode: 'insensitive' } },
          { Email: { equals: userName.trim(), mode: 'insensitive' } },
        ],
      },
    });

    if (!admin) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    let isValid = false;
    if (admin.password.startsWith('$2b$')) {
      isValid = await verifyPassword(password, admin.password);
    } else {
      isValid = password === admin.password;
    }

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = await signJWT({ id: admin.id, userName: admin.userName, role: 'admin' });

    return NextResponse.json({ token, id: admin.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}