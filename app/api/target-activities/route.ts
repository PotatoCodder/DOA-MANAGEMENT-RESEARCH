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
  const { targetActivity, date, objectivesId } = body;
  const newTarget = await prisma.targetActivities.create({
    data: {
      targetActivity,
      date: date ? new Date(date) : null,
      objectivesId
    }
  });
  return NextResponse.json(newTarget);
}