import { NextRequest, NextResponse } from 'next/server';
import { getAlerts } from '@/lib/scheduler';
import { sendTelegramMessage } from '@/lib/telegram';
import { format, parseISO, isPast, isFuture } from 'date-fns';
import { initDatabase } from '@/lib/db';

interface TelegramUpdate {
  message?: {
    chat: { id: number };
    text?: string;
    from?: { id: number; username?: string; first_name?: string };
  };
}

export async function POST(request: NextRequest) {
  try {
    // Ensure database is connected
    await initDatabase();
    
    const update: TelegramUpdate = await request.json();

    // Verify webhook secret if needed (optional security)
    const webhookSecret = request.headers.get('x-telegram-bot-api-secret-token');
    if (process.env.TELEGRAM_WEBHOOK_SECRET && webhookSecret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!update.message || !update.message.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = update.message.chat.id.toString();
    const messageText = update.message.text.trim();
    const command = messageText.split(' ')[0].toLowerCase();

    // Handle commands
    if (command === '/start' || command === '/help') {
      await sendTelegramMessage({
        chat_id: chatId,
        text: `👋 *Welcome to Tracked!*

*Available Commands:*
/alerts - View all your active alerts
/timeline - View your alerts timeline
/status - View alert statistics
/help - Show this help message

*Your Chat ID:* \`${chatId}\`
Use this ID in the web app to receive alerts here.

To create alerts, visit the web app and use your Chat ID.`,
        parse_mode: 'Markdown',
      });
    } else if (command === '/alerts') {
      await handleAlertsCommand(chatId);
    } else if (command === '/timeline') {
      await handleTimelineCommand(chatId);
    } else if (command === '/status') {
      await handleStatusCommand(chatId);
    } else {
      await sendTelegramMessage({
        chat_id: chatId,
        text: `❓ Unknown command. Use /help to see available commands.`,
        parse_mode: 'Markdown',
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error processing Telegram webhook:', error);
    return NextResponse.json({ ok: true }); // Return ok to prevent Telegram retries
  }
}

async function handleAlertsCommand(chatId: string) {
  try {
    const alerts = await getAlerts(chatId);

    if (alerts.length === 0) {
      await sendTelegramMessage({
        chat_id: chatId,
        text: `📭 *No Active Alerts*

You don't have any active alerts yet. Create one in the web app!`,
        parse_mode: 'Markdown',
      });
      return;
    }

    let message = `📋 *Your Active Alerts* (${alerts.length})\n\n`;

    alerts.forEach((alert: any, index: number) => {
      const scheduledTime = parseISO(alert.scheduled_time);
      const isSent = alert.sent === 1;
      const isOverdue = !isSent && isPast(scheduledTime);
      const status = isSent ? '✅ Sent' : isOverdue ? '⚠️ Overdue' : '⏳ Pending';

      message += `${index + 1}. *${alert.title}*\n`;
      message += `   ${alert.message}\n`;
      message += `   📅 ${format(scheduledTime, 'MMM dd, yyyy HH:mm')}\n`;
      message += `   ${status}\n\n`;
    });

    // Telegram has a 4096 character limit, so split if needed
    if (message.length > 4000) {
      const chunks = message.match(/[\s\S]{1,4000}/g) || [];
      for (const chunk of chunks) {
        await sendTelegramMessage({
          chat_id: chatId,
          text: chunk,
          parse_mode: 'Markdown',
        });
      }
    } else {
      await sendTelegramMessage({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
      });
    }
  } catch (error) {
    console.error('Error handling alerts command:', error);
    await sendTelegramMessage({
      chat_id: chatId,
      text: `❌ Error fetching alerts. Please try again later.`,
    });
  }
}

async function handleTimelineCommand(chatId: string) {
  try {
    const alerts = await getAlerts(chatId);

    if (alerts.length === 0) {
      await sendTelegramMessage({
        chat_id: chatId,
        text: `📭 *Empty Timeline*

You don't have any alerts yet. Create one in the web app!`,
        parse_mode: 'Markdown',
      });
      return;
    }

    // Group alerts by date
    const alertsByDate = new Map<string, any[]>();
    const now = new Date();

    alerts.forEach((alert: any) => {
      const scheduledTime = parseISO(alert.scheduled_time);
      const dateKey = format(scheduledTime, 'yyyy-MM-dd');
      
      if (!alertsByDate.has(dateKey)) {
        alertsByDate.set(dateKey, []);
      }
      alertsByDate.get(dateKey)!.push(alert);
    });

    // Sort dates
    const sortedDates = Array.from(alertsByDate.keys()).sort();

    let message = `📅 *Alert Timeline*\n\n`;

    sortedDates.forEach((dateKey) => {
      const date = parseISO(dateKey);
      const isToday = format(date, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');
      const isTomorrow = format(date, 'yyyy-MM-dd') === format(new Date(now.getTime() + 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
      
      let dateLabel = format(date, 'MMM dd, yyyy');
      if (isToday) dateLabel = `Today (${dateLabel})`;
      else if (isTomorrow) dateLabel = `Tomorrow (${dateLabel})`;

      message += `*${dateLabel}*\n`;

      const dayAlerts = alertsByDate.get(dateKey)!;
      dayAlerts.sort((a, b) => 
        parseISO(a.scheduled_time).getTime() - parseISO(b.scheduled_time).getTime()
      );

      dayAlerts.forEach((alert: any) => {
        const scheduledTime = parseISO(alert.scheduled_time);
        const isSent = alert.sent === 1;
        const status = isSent ? '✅' : isPast(scheduledTime) ? '⚠️' : '⏰';

        message += `${status} ${format(scheduledTime, 'HH:mm')} - ${alert.title}\n`;
      });

      message += `\n`;
    });

    // Split if too long
    if (message.length > 4000) {
      const chunks = message.match(/[\s\S]{1,4000}/g) || [];
      for (const chunk of chunks) {
        await sendTelegramMessage({
          chat_id: chatId,
          text: chunk,
          parse_mode: 'Markdown',
        });
      }
    } else {
      await sendTelegramMessage({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
      });
    }
  } catch (error) {
    console.error('Error handling timeline command:', error);
    await sendTelegramMessage({
      chat_id: chatId,
      text: `❌ Error fetching timeline. Please try again later.`,
    });
  }
}

async function handleStatusCommand(chatId: string) {
  try {
    const alerts = await getAlerts(chatId);

    if (alerts.length === 0) {
      await sendTelegramMessage({
        chat_id: chatId,
        text: `📊 *Alert Statistics*

*Total Alerts:* 0
*Active:* 0
*Sent:* 0
*Pending:* 0
*Overdue:* 0

Create your first alert in the web app!`,
        parse_mode: 'Markdown',
      });
      return;
    }

    const now = new Date();
    let sent = 0;
    let pending = 0;
    let overdue = 0;
    let upcoming = 0;
    const nextAlert = alerts.find((a: any) => !a.sent && isFuture(parseISO(a.scheduled_time)));

    alerts.forEach((alert: any) => {
      const scheduledTime = parseISO(alert.scheduled_time);
      if (alert.sent === 1) {
        sent++;
      } else if (isPast(scheduledTime)) {
        overdue++;
      } else {
        pending++;
        if (isFuture(scheduledTime)) {
          upcoming++;
        }
      }
    });

    let message = `📊 *Alert Statistics*\n\n`;
    message += `*Total Alerts:* ${alerts.length}\n`;
    message += `✅ *Sent:* ${sent}\n`;
    message += `⏳ *Pending:* ${pending}\n`;
    message += `⚠️ *Overdue:* ${overdue}\n`;
    message += `📅 *Upcoming:* ${upcoming}\n\n`;

    if (nextAlert) {
      const nextTime = parseISO(nextAlert.scheduled_time);
      const timeUntil = format(nextTime, 'MMM dd, yyyy HH:mm');
      message += `*Next Alert:*\n`;
      message += `📌 ${nextAlert.title}\n`;
      message += `⏰ ${timeUntil}\n`;
    } else {
      message += `*Next Alert:* None scheduled\n`;
    }

    await sendTelegramMessage({
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown',
    });
  } catch (error) {
    console.error('Error handling status command:', error);
    await sendTelegramMessage({
      chat_id: chatId,
      text: `❌ Error fetching status. Please try again later.`,
    });
  }
}

// GET endpoint for webhook verification (optional)
export async function GET() {
  return NextResponse.json({ 
    message: 'Telegram webhook endpoint. Use POST to receive updates.',
    instructions: 'Set this URL as your Telegram bot webhook: https://your-domain.com/api/telegram/webhook'
  });
}

