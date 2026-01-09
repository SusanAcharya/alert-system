# MongoDB Setup Guide

## Quick Setup

### 1. Get MongoDB Connection String

#### Option A: MongoDB Atlas (Recommended - Free Tier Available)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new cluster (choose the free M0 tier)
4. Create a database user:
   - Go to "Database Access" → "Add New Database User"
   - Choose "Password" authentication
   - Save the username and password
5. Whitelist your IP:
   - Go to "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (for Vercel) or add specific IPs
6. Get connection string:
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with your database name (e.g., `tracked-app`)

Example connection string:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/tracked-app?retryWrites=true&w=majority
```

#### Option B: Local MongoDB (Development Only)

For local development:
```
mongodb://localhost:27017/tracked-app
```

### 2. Add to Vercel Environment Variables

1. Go to your Vercel project dashboard
2. Settings → Environment Variables
3. Add:
   - **Key**: `MONGODB_URI`
   - **Value**: Your MongoDB connection string (from step 1)
4. Save and redeploy

### 3. Add to Local Environment

Create/update `.env.local`:
```
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/tracked-app?retryWrites=true&w=majority
```

### 4. Install Dependencies

```bash
npm install
```

This will install `mongoose` (MongoDB driver for Node.js).

### 5. Deploy

```bash
# Push to git (if using git deployment)
git add .
git commit -m "Add MongoDB integration"
git push

# Or redeploy on Vercel
```

## Verification

1. **Check Vercel Logs**:
   - Go to your Vercel project → Functions → View Logs
   - Look for: `✅ MongoDB connected successfully`

2. **Test the App**:
   - Try creating an alert
   - Check if it saves successfully
   - View alerts to confirm they're stored

3. **Check MongoDB Atlas**:
   - Go to your cluster → "Browse Collections"
   - You should see a `alerts` collection
   - Your alerts should appear there

## Troubleshooting

### "MONGODB_URI is not set"
- Make sure you added `MONGODB_URI` to Vercel environment variables
- Redeploy after adding the variable

### Connection timeout
- Check your IP whitelist in MongoDB Atlas
- Make sure "Allow Access from Anywhere" is enabled (0.0.0.0/0)

### Authentication failed
- Verify your username and password are correct
- Make sure you replaced `<password>` in the connection string

### Database not found
- The database will be created automatically when you first insert data
- Or create it manually in MongoDB Atlas

## MongoDB Atlas Free Tier Limits

- 512 MB storage
- Shared cluster resources
- Perfect for development and small apps
- Upgrade when you need more

## Security Best Practices

1. **Use strong passwords** for database users
2. **Restrict IP access** (though for Vercel you may need 0.0.0.0/0)
3. **Use environment variables** - never commit connection strings
4. **Enable MongoDB Atlas security features**:
   - Enable encryption at rest
   - Enable audit logging (if needed)

## Migration from SQLite

The code has been updated to use MongoDB. Your existing SQLite data won't automatically migrate, but:

1. All new alerts will be stored in MongoDB
2. Old SQLite data can be manually migrated if needed
3. The app will work immediately after setting up MongoDB

## Next Steps

✅ MongoDB is now integrated and ready to use!
✅ Your alerts will persist across function invocations
✅ Works perfectly on Vercel
✅ Scales automatically with MongoDB Atlas

Enjoy your fully functional alert system! 🎉

