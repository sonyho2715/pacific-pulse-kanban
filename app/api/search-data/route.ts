import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const [projects, clients] = await Promise.all([
      db.project.findMany({
        select: { id: true, name: true },
        orderBy: { updatedAt: 'desc' },
        take: 50,
      }),
      db.client.findMany({
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
        take: 50,
      }),
    ]);

    return NextResponse.json({
      success: true,
      projects,
      clients,
    });
  } catch (error) {
    console.error('Failed to fetch search data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch search data' },
      { status: 500 }
    );
  }
}
