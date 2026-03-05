import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyJWT } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ongoingResearchId = searchParams.get('ongoingResearchId');

    const authHeader = request.headers.get('authorization');
    let userId: string | null = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const payload = await verifyJWT(token);
      if (payload) {
        userId = (payload as { id: number; role: string }).id.toString();
      }
    }

    if (!userId) {
      return NextResponse.json([]);
    }

    if (!ongoingResearchId) {
      return NextResponse.json({ error: 'ongoingResearchId is required' }, { status: 400 });
    }

    // Fetch all work plans for this project so every user can VIEW all work plans of the project
    const objectives = await prisma.objectives.findMany({
      where: {
        ongoingResearchId: parseInt(ongoingResearchId),
      },
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

    const { id: employeeId, role: userRole } = payload as { id: number; role: string };

    // Only admin can create work plans
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Only admin can create work plans' }, { status: 403 });
    }

    const body = await request.json();
    const { objectives, targetActivities, ongoingResearchId } = body;

    if (!objectives) {
      return NextResponse.json({ error: 'Objectives field is required' }, { status: 400 });
    }

    if (!ongoingResearchId) {
      return NextResponse.json({ error: 'ongoingResearchId is required' }, { status: 400 });
    }

    const newObjective = await prisma.objectives.create({
      data: {
        objectives,
        targetActivities: targetActivities || null,
        employeeId,
        ongoingResearchId: parseInt(ongoingResearchId),
      },
    });
    return NextResponse.json(newObjective);
  } catch (error) {
    console.error('Error creating objective:', error);
    return NextResponse.json({ error: 'Failed to create objective' }, { status: 500 });
  }
}
