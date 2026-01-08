import { NextResponse } from 'next/server';
import { startScheduler } from '@/lib/scheduler';
import { initDatabase } from '@/lib/db';

export async function POST() {
  try {
    await initDatabase();
    await startScheduler();
    return NextResponse.json({ success: true, message: 'Scheduler started' });
  } catch (error) {
    console.error('Error starting scheduler:', error);
    return NextResponse.json(
      { error: 'Failed to start scheduler' },
      { status: 500 }
    );
  }
}

