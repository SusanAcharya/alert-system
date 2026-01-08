import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { scheduleAlert, scheduleMultipleAlerts, getAlerts, cancelAlert, startScheduler } from '@/lib/scheduler';
import { initDatabase } from '@/lib/db';
import type sqlite3 from 'sqlite3';

// Initialize database on first request
let dbInitPromise: Promise<sqlite3.Database> | null = null;
async function ensureDatabase() {
  if (!dbInitPromise) {
    dbInitPromise = initDatabase().then((db) => {
      console.log('Database initialized');
      return db;
    }).catch((error) => {
      console.error('Database initialization failed:', error);
      dbInitPromise = null; // Reset so we can retry
      throw error;
    });
  }
  return dbInitPromise;
}

const createAlertSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  telegramChatId: z.string().min(1, 'Telegram Chat ID is required'),
  alertType: z.enum(['time_based', 'date_based']),
  // For time-based alerts
  minutesFromNow: z.number().optional(),
  // For date-based alerts
  targetDate: z.string().optional(),
  offsets: z.array(z.object({
    value: z.number(),
    unit: z.enum(['minutes', 'hours', 'days', 'weeks', 'months']),
  })).optional(),
});

export async function POST(request: NextRequest) {
  try {
    await ensureDatabase();
    const body = await request.json();
    const data = createAlertSchema.parse(body);

    let alertIds: number[];

    if (data.alertType === 'time_based') {
      if (!data.minutesFromNow) {
        return NextResponse.json(
          { error: 'minutesFromNow is required for time-based alerts' },
          { status: 400 }
        );
      }

      const scheduledTime = new Date();
      scheduledTime.setMinutes(scheduledTime.getMinutes() + data.minutesFromNow);

      const alertId = await scheduleAlert(
        data.title,
        data.message,
        data.telegramChatId,
        scheduledTime,
        'time_based'
      );

      alertIds = [alertId];
    } else {
      if (!data.targetDate || !data.offsets || data.offsets.length === 0) {
        return NextResponse.json(
          { error: 'targetDate and offsets are required for date-based alerts' },
          { status: 400 }
        );
      }

      const targetDate = new Date(data.targetDate);
      alertIds = await scheduleMultipleAlerts(
        data.title,
        data.message,
        data.telegramChatId,
        targetDate,
        data.offsets
      );
    }

    // Auto-start scheduler if not already running
    try {
      await startScheduler();
    } catch (e) {
      // Scheduler might already be running, ignore
    }

    return NextResponse.json({ success: true, alertIds });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating alert:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Failed to create alert',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await ensureDatabase();
    const searchParams = request.nextUrl.searchParams;
    const telegramChatId = searchParams.get('telegramChatId');

    if (!telegramChatId) {
      return NextResponse.json(
        { error: 'telegramChatId is required' },
        { status: 400 }
      );
    }

    const alerts = await getAlerts(telegramChatId);
    return NextResponse.json({ alerts });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await ensureDatabase();
    const searchParams = request.nextUrl.searchParams;
    const alertId = searchParams.get('alertId');
    const telegramChatId = searchParams.get('telegramChatId');

    if (!alertId || !telegramChatId) {
      return NextResponse.json(
        { error: 'alertId and telegramChatId are required' },
        { status: 400 }
      );
    }

    await cancelAlert(parseInt(alertId), telegramChatId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error cancelling alert:', error);
    return NextResponse.json(
      { error: 'Failed to cancel alert' },
      { status: 500 }
    );
  }
}

