import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const parsedId = parseInt(id);
    const body = await request.json();
    const { objectives } = body;

    const updatedObjective = await prisma.objectives.update({
      where: { id: parsedId },
      data: {
        objectives
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