import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { userid, title, status, proponents, fundingAgency, file } = await request.json();

    if (!userid || !title || !status || !proponents || !fundingAgency || !file) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const proposal = await prisma.researchProposal.create({
      data: {
        userid,
        title,
        status,
        proponents,
        fundingAgency,
        file,
      },
    });

    return NextResponse.json(proposal);
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

    const proposals = await prisma.researchProposal.findMany({
      where,
      omit: { file: true },
      include: {
        comments: {
          omit: { file: true }
        },
        revisedProposals: {
          omit: { file: true }
        },
      },
      orderBy: { dateUpload: 'desc' },
    });

    return NextResponse.json(proposals);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}