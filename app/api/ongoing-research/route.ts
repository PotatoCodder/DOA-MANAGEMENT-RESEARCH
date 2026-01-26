import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const userId = formData.get('userId') as string;
    const title = formData.get('title') as string;
    const proponents = formData.get('proponents') as string;
    const fundingSource = formData.get('fundingSource') as string;
    const projectDuration = formData.get('projectDuration') as string;
    const budgetAllocation = formData.get('budgetAllocation') as string;
    const commodity = formData.get('commodity') as string;
    const status = formData.get('status') as string;
    const projectLocation = formData.get('projectLocation') as string;
    const pdfFile = formData.get('pdf') as File | null;

    if (!userId || !title || !proponents || !fundingSource || !projectDuration || !budgetAllocation || !commodity || !status) {
      return NextResponse.json({ error: 'All required fields are required' }, { status: 400 });
    }

    let pdfPath: string | undefined;
    if (pdfFile) {
      const bytes = await pdfFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${Date.now()}-${pdfFile.name}`;
      const filepath = path.join(process.cwd(), 'public', 'uploads', filename);
      await writeFile(filepath, buffer);
      pdfPath = `/uploads/${filename}`;
    }

    const research = await prisma.ongoingResearch.create({
      data: {
        userId,
        title,
        proponents,
        fundingSource,
        projectDuration,
        budgetAllocation,
        commodity,
        status,
        projectLocation,
        pdf: pdfPath,
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
    const userId = searchParams.get('userId');

    const where = userId ? { userId } : {};

    const researches = await prisma.ongoingResearch.findMany({
      where,
      include: {
        subResearches: true,
      },
      orderBy: { id: 'desc' },
    });

    return NextResponse.json(researches);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}