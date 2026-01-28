import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const objectivesId = searchParams.get('objectivesId');
  if (objectivesId) {
    const targetActivities = await prisma.targetActivities.findMany({
      where: { objectivesId: parseInt(objectivesId) }
    });
    return NextResponse.json(targetActivities);
  } else {
    const targetActivities = await prisma.targetActivities.findMany();
    return NextResponse.json(targetActivities);
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { targetActivity, startDate, endDate, objectivesId } = body;
  const newTarget = await prisma.targetActivities.create({
    data: {
      targetActivity,
      startDate: (startDate && startDate !== '') ? new Date(startDate) : null,
      endDate: (endDate && endDate !== '') ? new Date(endDate) : null,
      objectivesId
    }
  });
  return NextResponse.json(newTarget);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const objectivesId = searchParams.get('objectivesId');
  if (objectivesId) {
    await prisma.targetActivities.deleteMany({
      where: { objectivesId: parseInt(objectivesId) }
    });
    return NextResponse.json({ message: 'Deleted' });
  }
  return NextResponse.json({ error: 'objectivesId required' }, { status: 400 });
}