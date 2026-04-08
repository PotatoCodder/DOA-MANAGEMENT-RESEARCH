import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const userid = formData.get('userid') as string;
    const title = formData.get('title') as string;
    const researcher = formData.get('researcher') as string;
    const fundingAgency = formData.get('fundingAgency') as string;
    const projectDuration = formData.get('projectDuration') as string;
    const file = formData.get('file') as File | null;

    if (!userid || !title || !researcher || !fundingAgency || !projectDuration || !file) {
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

    const research = await prisma.completedResearch.create({
      data: {
        userid,
        title,
        researcher,
        fundingAgency,
        projectDuration,
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

    const researches = await prisma.completedResearch.findMany({
      where,
      orderBy: { id: 'desc' },
    });

    return NextResponse.json(researches);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}