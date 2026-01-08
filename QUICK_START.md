# 🚀 Quick Start Guide

## 5-Minute Setup

### 1. Install & Configure
```bash
npm install
```

Create `.env.local`:
```
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
```

### 2. Get Telegram Credentials
- **Bot Token**: Message [@BotFather](https://t.me/BotFather) → `/newbot`
- **Chat ID**: Message [@userinfobot](https://t.me/userinfobot)

### 3. Generate Icons
Open `scripts/generate-icons.html` in browser → Generate → Download → Move to `public/`

### 4. Run
```bash
npm run dev
```

Visit `http://localhost:3000` and create your first alert!

## First Alert Test

1. Enter your Telegram Chat ID
2. Title: "Test"
3. Message: "Hello from Tracked!"
4. Type: Time-based
5. Minutes: 1
6. Submit and wait 1 minute
7. Check Telegram! 📱

## That's It! 🎉

The scheduler starts automatically. For production, see README.md for deployment options.

