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

    const { role } = payload as { id: number; role: string };

    // Only allow admin to access employee data
    if (role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Fetch all employee data including password
    const employees = await prisma.employee.findMany({
      orderBy: { regDate: 'desc' }
    });

    return NextResponse.json(employees);
  } catch (error) {
    console.error('Failed to fetch employee data:', error);
    return NextResponse.json({ error: 'Failed to read employee data' }, { status: 500 });
  }
}

