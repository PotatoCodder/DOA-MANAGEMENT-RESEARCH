import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { userId, objectives, actualAccomplishment, dateConducted, documentation, ongoingResearchId, targetActivities } = await request.json();

    if (!userId || !objectives || !actualAccomplishment || !dateConducted || !documentation || !ongoingResearchId) {
      return NextResponse.json({ error: 'All required fields are required' }, { status: 400 });
    }

    const subResearch = await prisma.subOngoingResearch.create({
      data: {
        userId,
        objectives,
        actualAccomplishment,
        dateConducted,
        documentation,
        ongoingResearchId: parseInt(ongoingResearchId),
        ...(targetActivities && { targetActivities }),
      },
    });

    return NextResponse.json(subResearch);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ongoingResearchId = searchParams.get('ongoingResearchId');
    const userId = searchParams.get('userId');

    const where: any = {};
    if (ongoingResearchId) where.ongoingResearchId = parseInt(ongoingResearchId);
    if (userId) where.userId = userId;

    const subResearches = await prisma.subOngoingResearch.findMany({
      where,
      include: {
        ongoingResearch: true,
      },
      orderBy: { id: 'desc' },
    });

    return NextResponse.json(subResearches);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}