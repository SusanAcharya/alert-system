#!/bin/bash

# Telegram Webhook Setup Script
# Usage: ./scripts/setup-webhook.sh [webhook-url] [secret-token]

# Load .env.local if it exists
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
fi

WEBHOOK_URL="${1:-https://alert-system-tau.vercel.app/api/telegram/webhook}"
SECRET_TOKEN="${2:-}"

if [ -z "$TELEGRAM_BOT_TOKEN" ]; then
    echo "❌ Error: TELEGRAM_BOT_TOKEN is not set"
    echo ""
    echo "Please set it in one of these ways:"
    echo ""
    echo "1. Create/update .env.local file:"
    echo "   TELEGRAM_BOT_TOKEN=your_token_here"
    echo ""
    echo "2. Export as environment variable:"
    echo "   export TELEGRAM_BOT_TOKEN=your_token_here"
    echo ""
    echo "3. Pass it directly:"
    echo "   TELEGRAM_BOT_TOKEN=your_token_here ./scripts/setup-webhook.sh"
    echo ""
    exit 1
fi

echo "Setting up Telegram webhook..."
echo "Webhook URL: $WEBHOOK_URL"

if [ -n "$SECRET_TOKEN" ]; then
    echo "Secret Token: $SECRET_TOKEN"
    curl -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook" \
        -H "Content-Type: application/json" \
        -d "{\"url\": \"${WEBHOOK_URL}\", \"secret_token\": \"${SECRET_TOKEN}\"}"
else
    curl -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook" \
        -H "Content-Type: application/json" \
        -d "{\"url\": \"${WEBHOOK_URL}\"}"
fi

echo ""
echo "Webhook setup complete!"
echo ""
echo "Test it by sending /start to your bot on Telegram"
echo ""
echo "To check webhook info:"
echo "curl https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo"

