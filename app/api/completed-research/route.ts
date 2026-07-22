import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { userid, title, researcher, fundingAgency, projectDuration, file } = await request.json();

    if (!userid || !title || !researcher || !fundingAgency || !projectDuration || !file) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const research = await prisma.completedResearch.create({
      data: {
        userid,
        title,
        researcher,
        fundingAgency,
        projectDuration,
        file,
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
    const userid = searchParams.get('userid');

    const where = userid ? { userid } : {};

    const researches = await prisma.completedResearch.findMany({
      where,
      omit: { file: true },
      orderBy: { id: 'desc' },
    });

    return NextResponse.json(researches);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}