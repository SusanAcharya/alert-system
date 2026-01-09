# Vercel Database Setup

## ⚠️ Important: SQLite Limitation on Vercel

SQLite **does not work properly on Vercel** because:
- Vercel functions have a **read-only filesystem**
- SQLite needs to write to disk
- Database files won't persist between function invocations

## Current Solution (Temporary)

The app currently uses an **in-memory database** on Vercel, which means:
- ✅ Alerts can be created
- ❌ Data is **lost** when the function restarts
- ❌ Data doesn't persist between requests

## Recommended Solutions

### Option 1: Vercel KV (Redis) - Recommended ⭐

Vercel KV is a Redis-compatible database that works great with serverless:

1. **Install Vercel KV**:
   ```bash
   npm install @vercel/kv
   ```

2. **Set up in Vercel Dashboard**:
   - Go to your project → Storage → Create Database → KV
   - Copy the connection details

3. **Add environment variables**:
   ```
   KV_URL=your_kv_url
   KV_REST_API_URL=your_rest_api_url
   KV_REST_API_TOKEN=your_token
   ```

4. **Update the code** to use KV instead of SQLite

### Option 2: Vercel Postgres

1. **Set up in Vercel Dashboard**:
   - Go to your project → Storage → Create Database → Postgres
   - Copy the connection string

2. **Install dependencies**:
   ```bash
   npm install @vercel/postgres
   ```

3. **Update the code** to use Postgres

### Option 3: External Database Services

- **Supabase** (Postgres) - Free tier available
- **PlanetScale** (MySQL) - Free tier available
- **Turso** (SQLite-compatible) - Free tier available
- **Upstash** (Redis) - Free tier available

## Quick Fix: Use Turso (SQLite-compatible)

Turso is a serverless SQLite database that's compatible with your existing code:

1. **Sign up** at [turso.tech](https://turso.tech)
2. **Create a database**
3. **Get connection details** and add to Vercel environment variables
4. **Install Turso client**:
   ```bash
   npm install @libsql/client
   ```

5. **Update `lib/db.ts`** to use Turso instead of sqlite3

## Migration Guide

To migrate from SQLite to a persistent database:

1. Choose your database solution (recommended: Vercel KV or Turso)
2. Update `lib/db.ts` to use the new database client
3. Keep the same function signatures so other code doesn't need changes
4. Deploy and test

## Current Workaround

For now, the app uses in-memory storage on Vercel. This works for:
- Testing the app functionality
- Short-term alerts (within the same function invocation)
- Development

But **not for production** where data persistence is required.

## Need Help?

Check the Vercel logs to see the actual error messages. The improved error handling will now show more details about what's failing.

