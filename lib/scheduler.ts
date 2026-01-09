import cron from 'node-cron';
import { Alert } from './db';
import { sendTelegramMessage } from './telegram';
import { format, parseISO, isBefore, isFuture, isPast } from 'date-fns';

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
    const now = new Date();
    
    // Get all unsent, uncancelled alerts that are due
    const alerts = await Alert.find({
      sent: 0,
      cancelled: 0,
      scheduled_time: { $lte: now },
    }).sort({ scheduled_time: 1 });

    for (const alert of alerts) {
      const success = await sendTelegramMessage({
        chat_id: alert.telegram_chat_id,
        text: `🔔 *${alert.title}*\n\n${alert.message}`,
        parse_mode: 'Markdown',
      });

      if (success) {
        alert.sent = 1;
        await alert.save();
        console.log(`Alert ${alert._id} sent successfully`);
      } else {
        console.error(`Failed to send alert ${alert._id}`);
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
): Promise<string> {
  try {
    const alert = new Alert({
      title,
      message,
      telegram_chat_id: telegramChatId,
      alert_type: alertType,
      scheduled_time: scheduledTime,
      sent: 0,
      cancelled: 0,
    });

    const savedAlert = await alert.save();
    return savedAlert._id.toString();
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
): Promise<string[]> {
  const alertIds: string[] = [];

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
  const alerts = await Alert.find({
    telegram_chat_id: telegramChatId,
    cancelled: 0,
  }).sort({ scheduled_time: 1 });

  // Convert to format expected by frontend
  return alerts.map(alert => ({
    id: alert._id.toString(),
    title: alert.title,
    message: alert.message,
    telegram_chat_id: alert.telegram_chat_id,
    alert_type: alert.alert_type,
    scheduled_time: alert.scheduled_time.toISOString(),
    created_at: alert.created_at.toISOString(),
    sent: alert.sent,
    cancelled: alert.cancelled,
  }));
}

export async function cancelAlert(alertId: string, telegramChatId: string) {
  await Alert.updateOne(
    {
      _id: alertId,
      telegram_chat_id: telegramChatId,
    },
    {
      cancelled: 1,
    }
  );
}
