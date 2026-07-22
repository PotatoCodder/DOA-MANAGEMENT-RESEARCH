import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ model: string; id: string }> }
) {
  try {
    const params = await props.params;
    const { model, id } = params;
    const recordId = parseInt(id);

    if (isNaN(recordId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    let pdfBase64: string | null | undefined = null;

    switch (model) {
      case 'ongoingResearch':
        const ongoing = await prisma.ongoingResearch.findUnique({ where: { id: recordId }, select: { pdf: true } });
        pdfBase64 = ongoing?.pdf;
        break;
      case 'completedResearch':
        const completed = await prisma.completedResearch.findUnique({ where: { id: recordId }, select: { file: true } });
        pdfBase64 = completed?.file;
        break;
      case 'maturedResearch':
        const matured = await prisma.maturedResearch.findUnique({ where: { id: recordId }, select: { file: true } });
        pdfBase64 = matured?.file;
        break;
      case 'publicationResearch':
        const publication = await prisma.publicationResearch.findUnique({ where: { id: recordId }, select: { file: true } });
        pdfBase64 = publication?.file;
        break;
      case 'researchProposal':
        const proposal = await prisma.researchProposal.findUnique({ where: { id: recordId }, select: { file: true } });
        pdfBase64 = proposal?.file;
        break;
      case 'subOngoingResearch':
        const subOngoing = await prisma.subOngoingResearch.findUnique({ where: { id: recordId }, select: { documentation: true } });
        pdfBase64 = subOngoing?.documentation;
        break;
      case 'proposalComment':
        const comment = await prisma.proposalComment.findUnique({ where: { id: recordId }, select: { file: true } });
        pdfBase64 = comment?.file;
        break;
      case 'revisedProposal':
        const revised = await prisma.revisedProposal.findUnique({ where: { id: recordId }, select: { file: true } });
        pdfBase64 = revised?.file;
        break;
      default:
        return NextResponse.json({ error: 'Invalid model' }, { status: 400 });
    }

    if (!pdfBase64) {
      return new NextResponse('PDF not found', { status: 404 });
    }

    const pdfBuffer = Buffer.from(pdfBase64, 'base64');

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': pdfBuffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error fetching PDF:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
