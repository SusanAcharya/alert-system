#!/usr/bin/env node

/**
 * Telegram Webhook Setup Script
 * Usage: node scripts/setup-webhook.js [webhook-url] [secret-token]
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Try to load .env.local file
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

const WEBHOOK_URL = process.argv[2] || 'https://alert-system-tau.vercel.app/api/telegram/webhook';
const SECRET_TOKEN = process.argv[3] || process.env.TELEGRAM_WEBHOOK_SECRET || '';
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!BOT_TOKEN) {
  console.error('❌ Error: TELEGRAM_BOT_TOKEN is not set');
  console.error('');
  console.error('Please set it in one of these ways:');
  console.error('');
  console.error('1. Create/update .env.local file:');
  console.error('   TELEGRAM_BOT_TOKEN=your_token_here');
  console.error('');
  console.error('2. Export as environment variable:');
  console.error('   export TELEGRAM_BOT_TOKEN=your_token_here');
  console.error('');
  console.error('3. Pass it directly:');
  console.error('   TELEGRAM_BOT_TOKEN=your_token_here node scripts/setup-webhook.js');
  console.error('');
  process.exit(1);
}

async function setupWebhook() {
  try {
    console.log('Setting up Telegram webhook...');
    console.log(`Webhook URL: ${WEBHOOK_URL}`);
    
    const payload = { url: WEBHOOK_URL };
    if (SECRET_TOKEN) {
      payload.secret_token = SECRET_TOKEN;
      console.log('Using secret token for security');
    }

    const response = await axios.post(
      `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`,
      payload
    );

    if (response.data.ok) {
      console.log('✅ Webhook set successfully!');
      console.log(`\nResponse: ${JSON.stringify(response.data, null, 2)}`);
      console.log('\n📱 Test it by sending /start to your bot on Telegram');
    } else {
      console.error('❌ Failed to set webhook:', response.data);
    }

    // Get webhook info
    console.log('\n📋 Checking webhook info...');
    const infoResponse = await axios.get(
      `https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`
    );
    console.log(JSON.stringify(infoResponse.data, null, 2));
  } catch (error) {
    console.error('❌ Error setting up webhook:', error.response?.data || error.message);
    process.exit(1);
  }
}

setupWebhook();

