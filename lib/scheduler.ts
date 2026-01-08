import cron from 'node-cron';
import { getDatabase, promisifyDb } from './db';
import { sendTelegramMessage } from './telegram';
import { format, parseISO, isBefore } from 'date-fns';

let schedulerRunning = false;

export async function startScheduler() {
  if (schedulerRunning) {
    return;
  }

  schedulerRunning = true;
  
  // Check for pending alerts every minute
  cron.schedule('* * * * *', async () => {
    await processPendingAlerts();
  });

  console.log('Alert scheduler started');
}

async function processPendingAlerts() {
  try {
    const db = await getDatabase();
    const dbAsync = promisifyDb(db);
    
    const now = new Date().toISOString();
    
    // Get all unsent, uncancelled alerts that are due
    const alerts = await dbAsync.all(`
      SELECT * FROM alerts 
      WHERE sent = 0 
      AND cancelled = 0 
      AND scheduled_time <= ?
      ORDER BY scheduled_time ASC
    `, [now]) as any[];

    for (const alert of alerts) {
      const success = await sendTelegramMessage({
        chat_id: alert.telegram_chat_id,
        text: `🔔 *${alert.title}*\n\n${alert.message}`,
        parse_mode: 'Markdown',
      });

      if (success) {
        await dbAsync.run(
          'UPDATE alerts SET sent = 1 WHERE id = ?',
          [alert.id]
        );
        console.log(`Alert ${alert.id} sent successfully`);
      } else {
        console.error(`Failed to send alert ${alert.id}`);
      }
    }
  } catch (error) {
    console.error('Error processing alerts:', error);
  }
}

export async function scheduleAlert(
  title: string,
  message: string,
  telegramChatId: string,
  scheduledTime: Date,
  alertType: 'time_based' | 'date_based'
): Promise<number> {
  try {
    const db = await getDatabase();
    const dbAsync = promisifyDb(db);

    const result = await dbAsync.run(
      `INSERT INTO alerts (title, message, telegram_chat_id, alert_type, scheduled_time)
       VALUES (?, ?, ?, ?, ?)`,
      [title, message, telegramChatId, alertType, scheduledTime.toISOString()]
    );

    if (!result || result.lastID === undefined) {
      throw new Error('Failed to get lastID from database insert');
    }

    return result.lastID;
  } catch (error) {
    console.error('Error in scheduleAlert:', error);
    throw error;
  }
}

export async function scheduleMultipleAlerts(
  title: string,
  message: string,
  telegramChatId: string,
  targetDate: Date,
  offsets: Array<{ value: number; unit: 'minutes' | 'hours' | 'days' | 'weeks' | 'months' }>
): Promise<number[]> {
  const alertIds: number[] = [];

  for (const offset of offsets) {
    let scheduledTime: Date;
    
    if (offset.unit === 'minutes') {
      scheduledTime = new Date(targetDate.getTime() - offset.value * 60 * 1000);
    } else if (offset.unit === 'hours') {
      scheduledTime = new Date(targetDate.getTime() - offset.value * 60 * 60 * 1000);
    } else if (offset.unit === 'days') {
      scheduledTime = new Date(targetDate.getTime() - offset.value * 24 * 60 * 60 * 1000);
    } else if (offset.unit === 'weeks') {
      scheduledTime = new Date(targetDate.getTime() - offset.value * 7 * 24 * 60 * 60 * 1000);
    } else if (offset.unit === 'months') {
      scheduledTime = new Date(targetDate);
      scheduledTime.setMonth(scheduledTime.getMonth() - offset.value);
    } else {
      continue;
    }

    // Only schedule if the time is in the future
    if (isBefore(new Date(), scheduledTime)) {
      const alertId = await scheduleAlert(
        title,
        message,
        telegramChatId,
        scheduledTime,
        'date_based'
      );
      alertIds.push(alertId);
    }
  }

  return alertIds;
}

export async function getAlerts(telegramChatId: string) {
  const db = await getDatabase();
  const dbAsync = promisifyDb(db);

  const alerts = await dbAsync.all(`
    SELECT * FROM alerts 
    WHERE telegram_chat_id = ? 
    AND cancelled = 0
    ORDER BY scheduled_time ASC
  `, [telegramChatId]) as any[];

  return alerts;
}

export async function cancelAlert(alertId: number, telegramChatId: string) {
  const db = await getDatabase();
  const dbAsync = promisifyDb(db);

  await dbAsync.run(
    'UPDATE alerts SET cancelled = 1 WHERE id = ? AND telegram_chat_id = ?',
    [alertId, telegramChatId]
  );
}

