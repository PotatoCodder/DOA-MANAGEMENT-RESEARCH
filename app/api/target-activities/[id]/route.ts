import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const targetId = parseInt(id);

    if (isNaN(targetId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const { targetActivity, startDate, endDate } = await request.json();

    const updatedTarget = await prisma.targetActivities.update({
      where: { id: targetId },
      data: {
        ...(targetActivity && { targetActivity }),
        startDate: (startDate !== undefined) ? (startDate ? new Date(startDate) : null) : undefined,
        endDate: (endDate !== undefined) ? (endDate ? new Date(endDate) : null) : undefined,
      },
    });

    return NextResponse.json(updatedTarget);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const targetId = parseInt(id);

    if (isNaN(targetId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    await prisma.targetActivities.delete({
      where: { id: targetId },
    });

    return NextResponse.json({ message: 'Target activity deleted successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
