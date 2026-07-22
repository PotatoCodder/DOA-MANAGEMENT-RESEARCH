import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { verifyJWT } from '@/lib/jwt';

export async function POST(request: NextRequest) {
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

    const { id: userId } = payload as { id: number; role: string };

    const { title, proponents, fundingSource, projectDuration, budgetAllocation, commodity, status, projectLocation, pdf } = await request.json();

    if (!title || !proponents || !fundingSource || !projectDuration || !budgetAllocation || !commodity || !status) {
      return NextResponse.json({ error: 'All required fields are required' }, { status: 400 });
    }

    const research = await prisma.ongoingResearch.create({
      data: {
        userId: userId.toString(),
        title,
        proponents,
        fundingSource,
        projectDuration,
        budgetAllocation,
        commodity,
        status,
        projectLocation,
        pdf,
      },
    });

    return NextResponse.json(research);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const where = userId ? { userId } : {};

    const researches = await prisma.ongoingResearch.findMany({
      where,
      omit: { pdf: true },
      include: {
        subResearches: {
          omit: { documentation: true }
        }
      },
      orderBy: { id: 'desc' },
    });

    return NextResponse.json(researches);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}