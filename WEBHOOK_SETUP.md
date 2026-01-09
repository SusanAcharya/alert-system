# Telegram Webhook Setup Guide

Your app is deployed at: **https://alert-system-tau.vercel.app/**

## Quick Setup

### Option 1: Using the Setup Script (Recommended)

1. Make sure your `TELEGRAM_BOT_TOKEN` is set in your environment or `.env.local`:
   ```bash
   export TELEGRAM_BOT_TOKEN=your_bot_token_here
   ```

2. Run the setup script:
   ```bash
   npm run setup-webhook
   ```

   Or with a custom URL:
   ```bash
   node scripts/setup-webhook.js https://alert-system-tau.vercel.app/api/telegram/webhook
   ```

### Option 2: Using the API Endpoint

You can also use the built-in setup endpoint:

```bash
curl -X POST https://alert-system-tau.vercel.app/api/telegram/setup \
  -H "Content-Type: application/json" \
  -d '{
    "action": "set",
    "webhookUrl": "https://alert-system-tau.vercel.app/api/telegram/webhook"
  }'
```

### Option 3: Direct Telegram API Call

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://alert-system-tau.vercel.app/api/telegram/webhook"}'
```

## Verify Webhook Setup

Check if your webhook is set correctly:

```bash
curl https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo
```

You should see:
- `"url": "https://alert-system-tau.vercel.app/api/telegram/webhook"`
- `"pending_update_count": 0` (or a number if there are pending updates)

## Test the Bot Commands

Once the webhook is set, test the commands:

1. Open Telegram and find your bot
2. Send `/start` - You should get a welcome message
3. Send `/alerts` - View your alerts
4. Send `/timeline` - View your timeline
5. Send `/status` - View statistics
6. Send `/help` - See all commands

## Available Commands

- `/start` or `/help` - Show welcome message and available commands
- `/alerts` - View all your active alerts with details
- `/timeline` - View your alerts organized by date
- `/status` - View alert statistics and next upcoming alert

## Troubleshooting

### Webhook not working?

1. **Check webhook URL**: Make sure it's accessible:
   ```bash
   curl https://alert-system-tau.vercel.app/api/telegram/webhook
   ```
   Should return: `{"message":"Telegram webhook endpoint. Use POST to receive updates."}`

2. **Check bot token**: Verify your `TELEGRAM_BOT_TOKEN` is correct

3. **Check Vercel environment variables**: 
   - Go to your Vercel project settings
   - Add `TELEGRAM_BOT_TOKEN` in Environment Variables
   - Redeploy if needed

4. **Check webhook info**:
   ```bash
   curl https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo
   ```

### Commands not responding?

- Make sure the webhook is set correctly (see above)
- Check Vercel function logs for errors
- Verify the webhook endpoint is receiving requests (check Vercel logs)

## Security (Optional)

For added security, you can set a secret token:

1. Generate a secret token (any random string)
2. Add it to your Vercel environment variables as `TELEGRAM_WEBHOOK_SECRET`
3. Set the webhook with the secret:
   ```bash
   curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{
       "url": "https://alert-system-tau.vercel.app/api/telegram/webhook",
       "secret_token": "your_secret_token_here"
     }'
   ```

The webhook handler will verify this token on each request.

## Next Steps

1. ✅ Set up the webhook (using one of the methods above)
2. ✅ Test with `/start` command
3. ✅ Create alerts via the web app
4. ✅ View alerts via Telegram commands
5. ✅ Receive alerts when they trigger

Enjoy your fully functional alert system! 🎉

