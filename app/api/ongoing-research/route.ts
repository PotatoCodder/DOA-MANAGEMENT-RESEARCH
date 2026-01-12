import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { userId, title, proponents, fundingSource, projectDuration, budgetAllocation, commodity, status } = await request.json();

    if (!userId || !title || !proponents || !fundingSource || !projectDuration || !budgetAllocation || !commodity || !status) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const research = await prisma.ongoingResearch.create({
      data: {
        userId,
        title,
        proponents,
        fundingSource,
        projectDuration,
        budgetAllocation,
        commodity,
        status,
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
      include: {
        subResearches: true,
      },
      orderBy: { id: 'desc' },
    });

    return NextResponse.json(researches);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}