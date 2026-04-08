import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { verifyJWT } from '@/lib/jwt';

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
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const payload = await verifyJWT(token);

    if (!payload || !payload.role) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { id } = await params;
    const researchId = parseInt(id);

    if (isNaN(researchId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const { title, proponents, fundingSource, projectDuration, budgetAllocation, commodity, status, projectLocation, pdf } = await request.json();

    const data: any = {};
    if (title) data.title = title;
    if (proponents) data.proponents = proponents;
    if (fundingSource) data.fundingSource = fundingSource;
    if (projectDuration) data.projectDuration = projectDuration;
    if (budgetAllocation) data.budgetAllocation = budgetAllocation;
    if (commodity) data.commodity = commodity;
    if (status) data.status = status;
    if (projectLocation !== undefined) data.projectLocation = projectLocation;
    if (pdf) data.pdf = pdf;

    const research = await prisma.ongoingResearch.update({
      where: { id: researchId },
      data,
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
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const payload = await verifyJWT(token);

    if (!payload || !payload.role) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

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