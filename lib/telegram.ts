import axios from 'axios';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

export interface TelegramMessage {
  chat_id: string;
  text: string;
  parse_mode?: 'HTML' | 'Markdown';
}

export async function sendTelegramMessage(message: TelegramMessage): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN) {
    console.error('TELEGRAM_BOT_TOKEN is not set');
    return false;
  }

  try {
    const response = await axios.post(`${TELEGRAM_API_URL}/sendMessage`, message);
    return response.status === 200;
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    return false;
  }
}

export async function getTelegramBotInfo() {
  if (!TELEGRAM_BOT_TOKEN) {
    return null;
  }

  try {
    const response = await axios.get(`${TELEGRAM_API_URL}/getMe`);
    return response.data.result;
  } catch (error) {
    console.error('Error getting bot info:', error);
    return null;
  }
}

export async function setWebhook(url: string, secretToken?: string) {
  if (!TELEGRAM_BOT_TOKEN) {
    throw new Error('TELEGRAM_BOT_TOKEN is not set');
  }

  try {
    const payload: any = { url };
    if (secretToken) {
      payload.secret_token = secretToken;
    }

    const response = await axios.post(`${TELEGRAM_API_URL}/setWebhook`, payload);
    return response.data;
  } catch (error) {
    console.error('Error setting webhook:', error);
    throw error;
  }
}

export async function deleteWebhook() {
  if (!TELEGRAM_BOT_TOKEN) {
    throw new Error('TELEGRAM_BOT_TOKEN is not set');
  }

  try {
    const response = await axios.post(`${TELEGRAM_API_URL}/deleteWebhook`);
    return response.data;
  } catch (error) {
    console.error('Error deleting webhook:', error);
    throw error;
  }
}

