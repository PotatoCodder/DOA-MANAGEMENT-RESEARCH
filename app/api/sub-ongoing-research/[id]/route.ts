import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const researchId = parseInt(id);

    if (isNaN(researchId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const { userId, objectives, actualAccomplishment, dateConducted, remarks, documentation, ongoingResearchId, targetActivities } = await request.json();

    const updatedResearch = await prisma.subOngoingResearch.update({
      where: { id: researchId },
      data: {
        ...(userId && { userId }),
        ...(objectives && { objectives }),
        ...(actualAccomplishment && { actualAccomplishment }),
        ...(dateConducted && { dateConducted }),
        ...(remarks && { remarks }),
        ...(documentation && { documentation }),
        ...(ongoingResearchId && { ongoingResearchId: parseInt(ongoingResearchId) }),
        ...(targetActivities !== undefined && { targetActivities }),
      },
    });

    return NextResponse.json(updatedResearch);
  } catch (error) {
    console.error(error);
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ error: 'Sub research not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const researchId = parseInt(id);

    if (isNaN(researchId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    await prisma.subOngoingResearch.delete({
      where: { id: researchId },
    });

    return NextResponse.json({ message: 'Sub research deleted successfully' });
  } catch (error) {
    console.error(error);
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ error: 'Sub research not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}