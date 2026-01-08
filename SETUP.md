# Quick Setup Guide

## Step-by-Step Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Get Telegram Bot Token
1. Message [@BotFather](https://t.me/BotFather) on Telegram
2. Send `/newbot` and follow instructions
3. Copy the bot token (e.g., `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### 3. Get Your Telegram Chat ID
1. Message [@userinfobot](https://t.me/userinfobot) on Telegram
2. It will reply with your Chat ID (a number like `123456789`)
3. Or visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates` after messaging your bot

### 4. Create Environment File
Create `.env.local` in the project root:
```
TELEGRAM_BOT_TOKEN=your_bot_token_here
NODE_ENV=development
```

### 5. Create PWA Icons (Quick Method)

**Option 1: Use ImageMagick (if installed)**
```bash
# Create 192x192 icon
convert -size 192x192 xc:#0ea5e9 -pointsize 72 -fill white -gravity center -annotate +0+0 "T" public/icon-192x192.png

# Create 512x512 icon
convert -size 512x512 xc:#0ea5e9 -pointsize 200 -fill white -gravity center -annotate +0+0 "T" public/icon-512x512.png
```

**Option 2: Use Online Tool**
1. Go to https://realfavicongenerator.net/
2. Upload any square image (or use their generator)
3. Download and place icons in `public/` folder

**Option 3: Create Simple Placeholder (for development)**
- Use any image editor to create:
  - 192x192px blue square → `icon-192x192.png`
  - 512x512px blue square → `icon-512x512.png`
- Place both in the `public/` directory

### 6. Start the App
```bash
npm run dev
```

The app will be at `http://localhost:3000`

### 7. Start the Scheduler

**Option A: Auto-start (Recommended)**
The scheduler will start automatically when you create your first alert via the API.

**Option B: Manual start**
In a separate terminal:
```bash
npm run scheduler
```

Or call the API:
```bash
curl -X POST http://localhost:3000/api/scheduler/start
```

## Testing

1. Open `http://localhost:3000`
2. Enter your Telegram Chat ID
3. Create a test alert:
   - Title: "Test Alert"
   - Message: "This is a test"
   - Type: Time-based
   - Minutes: 1
4. Wait 1 minute and check Telegram for the message!

## Troubleshooting

**"Cannot find module" errors**: Run `npm install` again

**Alerts not sending**: 
- Check scheduler is running
- Verify TELEGRAM_BOT_TOKEN is correct
- Check Telegram Chat ID is correct

**Database errors**: 
- Ensure write permissions in project directory
- Delete `alerts.db` and restart (will recreate)

