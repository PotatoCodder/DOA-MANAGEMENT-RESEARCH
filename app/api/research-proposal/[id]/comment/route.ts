import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const researchProposalId = parseInt(id);

    if (isNaN(researchProposalId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const { content, file } = await request.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const comment = await prisma.proposalComment.create({
      data: {
        content,
        file,
        researchProposalId,
      },
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
