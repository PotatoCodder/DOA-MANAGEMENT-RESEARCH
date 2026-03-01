import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyJWT } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    let userId: string | null = null;
    let userRole: string | null = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const payload = await verifyJWT(token);
      if (payload) {
        userId = (payload as { id: number; role: string }).id.toString();
        userRole = (payload as { id: number; role: string }).role;
      }
    }

    // If no userId from token, return empty array
    if (!userId) {
      return NextResponse.json([]);
    }

    // All users can only see their own work plans
    const where = { employeeId: parseInt(userId) };

    const objectives = await prisma.objectives.findMany({
      where,
      include: {
        targetActivityList: true,
        employee: {
          select: { fullName: true, employeeId: true }
        }
      },
      orderBy: { id: 'desc' },
    });
    return NextResponse.json(objectives);
  } catch (error) {
    console.error('Error fetching objectives:', error);
    return NextResponse.json({ error: 'Failed to fetch objectives' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const payload = await verifyJWT(token);

    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { id: employeeId } = payload as { id: number; role: string };

    const body = await request.json();
    const { objectives, targetActivities } = body;

    if (!objectives) {
      return NextResponse.json({ error: 'Objectives field is required' }, { status: 400 });
    }

    const newObjective = await prisma.objectives.create({
      data: {
        objectives,
        targetActivities: targetActivities || null,
        employeeId,
      },
    });
    return NextResponse.json(newObjective);
  } catch (error) {
    console.error('Error creating objective:', error);
    return NextResponse.json({ error: 'Failed to create objective' }, { status: 500 });
  }
}
