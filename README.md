# Tracked - Custom Alerts & Reminders PWA

A mobile-first Progressive Web App (PWA) that allows you to set up fully customizable alerts and reminders with Telegram notifications.

## Features

- ⏰ **Time-based alerts**: Set reminders for X minutes from now (e.g., "remind me in 5 minutes")
- 📅 **Date-based alerts**: Set reminders before important dates with multiple alert times
  - Preset options: 1 month before, 1 week before, 1 day before, 1 hour before
  - Custom offsets: Set any combination of days, weeks, or months before
- 📱 **Mobile-first design**: Optimized for mobile devices with PWA support
- 🎨 **Modern UI**: Professional, clean interface built with Tailwind CSS
- 🔔 **Telegram integration**: Receive all alerts via Telegram messages
- 💬 **Telegram Commands**: Interact with your bot via commands:
  - `/alerts` - View all your active alerts
  - `/timeline` - View your alerts timeline
  - `/status` - View alert statistics
  - `/help` - Show available commands
- 💾 **SQLite database**: Lightweight, file-based database (no external DB required)

## Prerequisites

- Node.js 18+ and npm
- A Telegram account
- A Telegram Bot Token (see setup instructions below)

## Setup Instructions

### 1. Get Your Telegram Bot Token

1. Open Telegram and search for [@BotFather](https://t.me/BotFather)
2. Send `/newbot` and follow the instructions to create a new bot
3. Copy the bot token you receive (looks like `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)
4. Start a chat with your new bot and send any message
5. Get your Chat ID:
   - Search for [@userinfobot](https://t.me/userinfobot) on Telegram
   - Start a chat and it will show your Chat ID
   - Or visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates` and look for `"chat":{"id":...}`

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Telegram bot token:

```
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
NODE_ENV=development
```

### 4. Create PWA Icons

The app needs icon files for PWA functionality. You have several options:

**Option A: Use the built-in generator (Easiest)**
1. Open `scripts/generate-icons.html` in your browser
2. Customize the icon (text, colors)
3. Click "Generate Icons" to preview
4. Click "Download Icons" to save
5. Move the downloaded files to the `public/` directory

**Option B: Use an online icon generator**
1. Create a 512x512px icon image
2. Use a tool like [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator) or [RealFaviconGenerator](https://realfavicongenerator.net/)
3. Place the generated icons in the `public/` directory:
   - `icon-192x192.png`
   - `icon-512x512.png`

**Option C: Create simple placeholder icons**
For development, you can create simple colored squares using ImageMagick or any image editor.

### 5. Start the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### 6. Start the Alert Scheduler

The scheduler needs to run to process and send alerts. You have two options:

**Option A: Start scheduler via API (Recommended for development)**
- The scheduler will start automatically when you make your first API call
- Or manually trigger it by calling: `POST http://localhost:3000/api/scheduler/start`

**Option B: Run scheduler as a separate process (Recommended for production)**

Create a separate terminal and run:

```bash
node scripts/start-scheduler.js
```

Or add this to your package.json scripts and use `npm run scheduler`:

```json
"scripts": {
  "scheduler": "node scripts/start-scheduler.js"
}
```

## Usage

1. **Open the app** in your browser (or install as PWA on mobile)
2. **Enter your Telegram Chat ID** in the form
3. **Create an alert**:
   - **Time-based**: Enter title, message, and minutes from now
   - **Date-based**: Enter title, message, target date/time, and select alert times
4. **View your alerts** by entering your Chat ID in the alerts list section
5. **Receive notifications** via Telegram when alerts are triggered

## Project Structure

```
tracked-app/
├── app/
│   ├── api/
│   │   ├── alerts/          # Alert CRUD endpoints
│   │   └── scheduler/       # Scheduler control
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Main page
│   └── globals.css          # Global styles
├── components/
│   ├── AlertForm.tsx        # Alert creation form
│   └── AlertList.tsx        # List of user alerts
├── lib/
│   ├── db.ts                # Database utilities
│   ├── scheduler.ts         # Alert scheduling logic
│   └── telegram.ts          # Telegram API integration
├── public/
│   ├── manifest.json        # PWA manifest
│   └── icon-*.png           # PWA icons
└── scripts/
    └── start-scheduler.js   # Standalone scheduler script
```

## Building for Production

```bash
npm run build
npm start
```

Make sure to:
1. Set `NODE_ENV=production` in your `.env.local`
2. Start the scheduler process separately or use a process manager like PM2
3. Set up proper icon files for PWA

## Database

The app uses SQLite, which creates a local `alerts.db` file automatically. This file contains all your alerts and is stored in the project root.

**Note**: For production deployments, consider:
- Using a more robust database (PostgreSQL, MySQL)
- Setting up proper backups
- Using environment-specific database paths

## Webhook Setup (For Telegram Commands)

To enable Telegram bot commands (`/alerts`, `/timeline`, `/status`), you need to set up a webhook:

1. **Deploy your app** to a public URL (e.g., Vercel, Railway, or your own server)

2. **Set the webhook** by calling the setup endpoint:
   ```bash
   curl -X POST https://your-domain.com/api/telegram/setup \
     -H "Content-Type: application/json" \
     -d '{
       "action": "set",
       "webhookUrl": "https://your-domain.com/api/telegram/webhook",
       "secretToken": "your-optional-secret-token"
     }'
   ```

3. **Or set it manually** using Telegram Bot API:
   ```bash
   curl https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://your-domain.com/api/telegram/webhook
   ```

4. **Test it** by sending `/start` to your bot on Telegram

**Note**: For local development, you can use tools like [ngrok](https://ngrok.com/) to expose your local server:
```bash
ngrok http 3000
# Then use the ngrok URL as your webhook URL
```

## Troubleshooting

### Alerts not being sent
- Check that the scheduler is running
- Verify your `TELEGRAM_BOT_TOKEN` is correct
- Ensure your Telegram Chat ID is correct
- Check server logs for errors

### Telegram commands not working
- Verify the webhook is set correctly (check with BotFather or the setup endpoint)
- Ensure your app is publicly accessible (not just localhost)
- Check that the webhook URL is correct and returns 200 OK
- Verify `TELEGRAM_BOT_TOKEN` is set in your environment

### PWA not installing
- Ensure you're using HTTPS (required for PWA)
- Check that `manifest.json` and icons are in the `public/` directory
- Verify icons are properly sized (192x192 and 512x512)

### Database errors
- Ensure the app has write permissions in the project directory
- Check that SQLite3 is properly installed

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite3
- **Scheduling**: node-cron
- **PWA**: next-pwa
- **HTTP Client**: Axios
- **Validation**: Zod
- **Date Utilities**: date-fns

## License

MIT

## Support

For issues or questions, please check the troubleshooting section or create an issue in the repository.

# alert-system
