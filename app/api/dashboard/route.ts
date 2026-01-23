import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'app/data/dashboard.json');

export async function GET() {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    const dashboard = JSON.parse(data);
    return NextResponse.json(dashboard);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read dashboard data' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const dashboard = await request.json();
    fs.writeFileSync(filePath, JSON.stringify(dashboard, null, 2));
    return NextResponse.json({ message: 'Dashboard updated successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update dashboard' }, { status: 500 });
  }
}