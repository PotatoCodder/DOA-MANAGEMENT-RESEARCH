import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { verifyJWT } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const payload = await verifyJWT(token);

    if (!payload || !payload.role) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { id: userId } = payload as { id: number; role: string };

    const formData = await request.formData();

    const title = formData.get('title') as string;
    const proponents = formData.get('proponents') as string;
    const fundingSource = formData.get('fundingSource') as string;
    const projectDuration = formData.get('projectDuration') as string;
    const budgetAllocation = formData.get('budgetAllocation') as string;
    const commodity = formData.get('commodity') as string;
    const status = formData.get('status') as string;
    const projectLocation = formData.get('projectLocation') as string;
    const pdfFile = formData.get('pdf') as File | null;

    if (!title || !proponents || !fundingSource || !projectDuration || !budgetAllocation || !commodity || !status) {
      return NextResponse.json({ error: 'All required fields are required' }, { status: 400 });
    }

    let pdfPath: string | undefined;
    if (pdfFile && pdfFile instanceof File && pdfFile.size > 0) {
      try {
        const bytes = await pdfFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filename = `${Date.now()}-${pdfFile.name.replace(/\s+/g, '_')}`;
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        const filepath = path.join(uploadDir, filename);

        // Ensure the uploads directory exists
        try {
          await mkdir(uploadDir, { recursive: true });
        } catch (mkdirError) {
          console.error('Failed to create uploads directory:', mkdirError);
          // Continue, might still work if directory exists
        }

        await writeFile(filepath, buffer);
        pdfPath = `/uploads/${filename}`;
      } catch (fileError) {
        console.error('Failed to save PDF file:', fileError);
        return NextResponse.json({ error: 'Failed to upload PDF file' }, { status: 500 });
      }
    }

    const research = await prisma.ongoingResearch.create({
      data: {
        userId: userId.toString(),
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