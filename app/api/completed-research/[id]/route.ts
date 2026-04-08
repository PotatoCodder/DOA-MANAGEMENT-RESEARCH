import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const researchId = parseInt(id);

    if (isNaN(researchId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const research = await prisma.completedResearch.findUnique({
      where: { id: researchId },
    });

    if (!research) {
      return NextResponse.json({ error: 'Research not found' }, { status: 404 });
    }

    return NextResponse.json(research);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const researchId = parseInt(id);

    if (isNaN(researchId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const formData = await request.formData();
    
    const title = formData.get('title') as string;
    const researcher = formData.get('researcher') as string;
    const fundingAgency = formData.get('fundingAgency') as string;
    const projectDuration = formData.get('projectDuration') as string;
    const file = formData.get('file') as File | null;

    let filePath: string | undefined;
    if (file && typeof file !== 'string') {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      const fullPath = path.join(uploadDir, filename);

      await mkdir(uploadDir, { recursive: true });
      await writeFile(fullPath, buffer);
      filePath = `/uploads/${filename}`;
    }

    const research = await prisma.completedResearch.update({
      where: { id: researchId },
      data: {
        ...(title && { title }),
        ...(researcher && { researcher }),
        ...(fundingAgency && { fundingAgency }),
        ...(projectDuration && { projectDuration }),
        ...(filePath && { file: filePath }),
      },
    });

    return NextResponse.json(research);
  } catch (error) {
    console.error(error);
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ error: 'Research not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const researchId = parseInt(id);

    if (isNaN(researchId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    await prisma.completedResearch.delete({
      where: { id: researchId },
    });

    return NextResponse.json({ message: 'Research deleted successfully' });
  } catch (error) {
    console.error(error);
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ error: 'Research not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}