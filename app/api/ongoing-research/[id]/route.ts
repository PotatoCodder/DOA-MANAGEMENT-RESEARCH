import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const researchId = parseInt(id);

    if (isNaN(researchId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const research = await prisma.ongoingResearch.findUnique({
      where: { id: researchId },
    });

    if (!research) {
      return NextResponse.json({ error: 'Research not found' }, { status: 404 });
    }

    return NextResponse.json(research);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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

    const { title, proponents, fundingSource, projectDuration, budgetAllocation, commodity, status } = await request.json();

    const research = await prisma.ongoingResearch.update({
      where: { id: researchId },
      data: {
        ...(title && { title }),
        ...(proponents && { proponents }),
        ...(fundingSource && { fundingSource }),
        ...(projectDuration && { projectDuration }),
        ...(budgetAllocation && { budgetAllocation }),
        ...(commodity && { commodity }),
        ...(status && { status }),
      },
    });

    return NextResponse.json(research);
  } catch (error) {
    console.error(error);
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ error: 'Research not found' }, { status: 404 });
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

    await prisma.ongoingResearch.delete({
      where: { id: researchId },
    });

    return NextResponse.json({ message: 'Research deleted successfully' });
  } catch (error) {
    console.error(error);
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ error: 'Research not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}