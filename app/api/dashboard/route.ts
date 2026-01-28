import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyJWT } from '@/lib/jwt';

export async function GET() {
  try {
    const recentActivities = await prisma.recentActivity.findMany({
      select: { activities: true },
      orderBy: { updatedAt: 'desc' }
    });
    const announcements = await prisma.announcement.findMany({
      select: { content: true },
      orderBy: { updatedAt: 'desc' }
    });

    const dashboard = {
      recentActivity: recentActivities.map(ra => ra.activities),
      announcements: announcements.map(a => a.content)
    };

    return NextResponse.json(dashboard);
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    return NextResponse.json({ error: 'Failed to read dashboard data' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
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

    const { id, role } = payload as { id: number; role: string };
    const userId = id.toString();

    const dashboard = await request.json();
    const { recentActivity, announcements } = dashboard;

    // Delete existing data
    await prisma.recentActivity.deleteMany();
    await prisma.announcement.deleteMany();

    // Insert new recent activities
    if (recentActivity && Array.isArray(recentActivity)) {
      await prisma.recentActivity.createMany({
        data: recentActivity.map(activity => ({
          userId,
          title: activity, // or set to ''
          activities: activity
        }))
      });
    }

    // Insert new announcements
    if (announcements && Array.isArray(announcements)) {
      await prisma.announcement.createMany({
        data: announcements.map(content => ({
          userid: userId,
          content
        }))
      });
    }

    return NextResponse.json({ message: 'Dashboard updated successfully' });
  } catch (error) {
    console.error('Failed to update dashboard:', error);
    return NextResponse.json({ error: 'Failed to update dashboard' }, { status: 500 });
  }
}