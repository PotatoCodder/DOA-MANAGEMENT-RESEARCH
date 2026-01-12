import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { userid, title, proponents, journal, published, file } = await request.json();

    if (!userid || !title || !proponents || !journal || !published || !file) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const research = await prisma.publicationResearch.create({
      data: {
        userid,
        title,
        proponents,
        journal,
        published,
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

    const researches = await prisma.publicationResearch.findMany({
      where,
      orderBy: { id: 'desc' },
    });

    return NextResponse.json(researches);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}