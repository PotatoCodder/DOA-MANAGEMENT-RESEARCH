import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const userid = formData.get('userid') as string;
    const title = formData.get('title') as string;
    const proponents = formData.get('proponents') as string;
    const fundingAgency = formData.get('fundingAgency') as string;
    const journal = formData.get('journal') as string;
    const published = formData.get('published') as string;
    const file = formData.get('file') as File | null;

    if (!userid || !title || !proponents || !fundingAgency || !journal || !published || !file) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    let filePath: string | undefined;
    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      const fullPath = path.join(uploadDir, filename);

      await mkdir(uploadDir, { recursive: true });
      await writeFile(fullPath, buffer);
      filePath = `/uploads/${filename}`;
    }

    const research = await prisma.publicationResearch.create({
      data: {
        userid,
        title,
        proponents,
        fundingAgency,
        journal,
        published,
        file: filePath || '',
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