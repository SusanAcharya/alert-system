import mongoose from 'mongoose';

// MongoDB connection string from environment variable
const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
  console.warn('⚠️  MONGODB_URI is not set. Database operations will fail.');
}

// Alert Schema
const AlertSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  telegram_chat_id: {
    type: String,
    required: true,
    index: true, // Index for faster queries
  },
  alert_type: {
    type: String,
    required: true,
    enum: ['time_based', 'date_based'],
  },
  scheduled_time: {
    type: Date,
    required: true,
    index: true, // Index for faster queries
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  sent: {
    type: Number,
    default: 0,
  },
  cancelled: {
    type: Number,
    default: 0,
  },
});

// Alert Config Schema (for future use)
const AlertConfigSchema = new mongoose.Schema({
  alert_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Alert',
  },
  offset_type: String,
  offset_value: Number,
  offset_unit: String,
});

// Models
export const Alert = mongoose.models.Alert || mongoose.model('Alert', AlertSchema);
export const AlertConfig = mongoose.models.AlertConfig || mongoose.model('AlertConfig', AlertConfigSchema);

// Connection state
let isConnected = false;

// Connect to MongoDB
export async function initDatabase(): Promise<typeof mongoose> {
  if (isConnected) {
    return mongoose;
  }

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  try {
    const db = await mongoose.connect(MONGODB_URI, {
      // Connection options
    });

    isConnected = db.connections[0].readyState === 1;
    
    if (isConnected) {
      console.log('✅ MongoDB connected successfully');
    } else {
      throw new Error('Failed to establish MongoDB connection');
    }

    return db;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    isConnected = false;
    throw error;
  }
}

// Get database connection status
export function getDatabaseStatus() {
  return {
    connected: isConnected,
    readyState: mongoose.connection.readyState,
  };
}

// Close database connection (useful for cleanup)
export async function closeDatabase() {
  if (isConnected) {
    await mongoose.connection.close();
    isConnected = false;
    console.log('MongoDB connection closed');
  }
}
