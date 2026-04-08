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

    const { file, description } = await request.json();

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    const revisedProposal = await prisma.revisedProposal.create({
      data: {
        file,
        description,
        researchProposalId,
      },
    });

    return NextResponse.json(revisedProposal);
  } catch (error) {
    console.error('Error creating revised proposal:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
