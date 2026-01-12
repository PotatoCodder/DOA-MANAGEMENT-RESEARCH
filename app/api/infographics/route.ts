import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { title, image } = await request.json();

    if (!title || !image) {
      return NextResponse.json({ error: 'Title and image are required' }, { status: 400 });
    }

    const infographic = await prisma.infographics.create({
      data: {
        title,
        image,
      },
    });

    return NextResponse.json(infographic);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const infographics = await prisma.infographics.findMany({
      orderBy: { id: 'desc' },
    });

    const response = NextResponse.json(infographics);
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=59');
    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}