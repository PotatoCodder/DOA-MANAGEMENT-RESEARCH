import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const objectives = await prisma.objectives.findMany({
    include: { targetActivityList: true }
  });
  return NextResponse.json(objectives);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { objectives, targetActivities, date } = body;
  const newObjective = await prisma.objectives.create({
    data: {
      objectives,
      targetActivities,
      date: date ? new Date(date) : null
    }
  });
  return NextResponse.json(newObjective);
}