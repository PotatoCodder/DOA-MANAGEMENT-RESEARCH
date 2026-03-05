import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyJWT } from '@/lib/jwt';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const parsedId = parseInt(id);

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const payload = await verifyJWT(token);

    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { role: userRole } = payload as { id: number; role: string };

    // Only admin can update work plans
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Only admin can update work plans' }, { status: 403 });
    }

    const body = await request.json();
    const { objectives, targetActivities } = body;

    const existingObjective = await prisma.objectives.findFirst({
      where: { id: parsedId },
    });

    if (!existingObjective) {
      return NextResponse.json({ error: 'Objective not found' }, { status: 404 });
    }

    const updatedObjective = await prisma.objectives.update({
      where: { id: parsedId },
      data: {
        objectives: objectives || existingObjective.objectives,
        targetActivities: targetActivities !== undefined ? targetActivities : existingObjective.targetActivities,
      }
    });

    return NextResponse.json(updatedObjective);
  } catch (error) {
    console.error('Error updating objective:', error);
    return NextResponse.json({ error: 'Failed to update objective' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const parsedId = parseInt(id);

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const payload = await verifyJWT(token);

    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { role: userRole } = payload as { id: number; role: string };

    // Only admin can delete work plans
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Only admin can delete work plans' }, { status: 403 });
    }

    const existingObjective = await prisma.objectives.findFirst({
      where: { id: parsedId },
    });

    if (!existingObjective) {
      return NextResponse.json({ error: 'Objective not found' }, { status: 404 });
    }

    // First delete associated target activities
    await prisma.targetActivities.deleteMany({
      where: { objectivesId: parsedId }
    });

    // Then delete the objective
    await prisma.objectives.delete({
      where: { id: parsedId }
    });

    return NextResponse.json({ message: 'Objective deleted successfully' });
  } catch (error) {
    console.error('Error deleting objective:', error);
    return NextResponse.json({ error: 'Failed to delete objective' }, { status: 500 });
  }
}
