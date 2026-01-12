import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'app/data/total-projects.json');

export async function GET() {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    const projects = JSON.parse(data);
    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read projects' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const projects = await request.json();
    fs.writeFileSync(filePath, JSON.stringify(projects, null, 2));
    return NextResponse.json({ message: 'Projects updated successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update projects' }, { status: 500 });
  }
}