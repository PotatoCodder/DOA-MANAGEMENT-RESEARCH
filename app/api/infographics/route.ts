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
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    const infographics = await prisma.infographics.findMany({
      orderBy: { id: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.infographics.count();

    const response = NextResponse.json({ infographics, total, page, limit });
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=59');
    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}