import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyJWT } from '@/lib/jwt';

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

    const { id: userId } = payload as { id: number; role: string };

    const body = await request.json();
    const { objectives, actualAccomplishment, dateConducted, remarks, documentation, ongoingResearchId, targetActivities } = body;

    if (!objectives || !actualAccomplishment || !dateConducted || !remarks || !documentation || !ongoingResearchId) {
      return NextResponse.json({ error: 'All required fields are required' }, { status: 400 });
    }

    const subResearch = await prisma.subOngoingResearch.create({
      data: {
        userId: userId.toString(),
        objectives,
        actualAccomplishment,
        dateConducted,
        remarks,
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

    const authHeader = request.headers.get('authorization');
    let userId: string | null = null;
    let userRole: string | null = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const payload = await verifyJWT(token);
      if (payload) {
        userId = (payload as { id: number; role: string }).id.toString();
        userRole = (payload as { id: number; role: string }).role;
      }
    }

    const where: any = {};
    if (ongoingResearchId) where.ongoingResearchId = parseInt(ongoingResearchId);

    const subResearches = await prisma.subOngoingResearch.findMany({
      where,
      omit: { documentation: true },
      include: {
        ongoingResearch: {
          omit: { pdf: true }
        },
      },
      orderBy: { id: 'desc' },
    });

    return NextResponse.json(subResearches);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}