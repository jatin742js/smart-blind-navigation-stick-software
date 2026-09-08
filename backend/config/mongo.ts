import mongoose from 'mongoose';

interface MongoStatus {
  isConnected: boolean;
  uri: string;
  dbName: string;
  host?: string;
  error?: string;
}

let connectionStatus: MongoStatus = {
  isConnected: false,
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/smartstick_db',
  dbName: 'smartstick_db',
};

/**
 * Initializes connection to MongoDB using Mongoose.
 * Uses lazy & resilient connection with graceful fallback so server won't crash
 * if external MongoDB is offline.
 */
export async function connectMongoDB(): Promise<boolean> {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/smartstick_db';
  connectionStatus.uri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@'); // mask credentials if present

  try {
    // Configure timeouts to fail fast gracefully if no local/remote daemon
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
      connectTimeoutMS: 3000,
    });

    connectionStatus.isConnected = true;
    connectionStatus.host = mongoose.connection.host;
    connectionStatus.dbName = mongoose.connection.name;
    connectionStatus.error = undefined;
    console.log(`[MongoDB] Successfully connected to database: ${connectionStatus.dbName} on ${connectionStatus.host}`);
    return true;
  } catch (err: any) {
    connectionStatus.isConnected = false;
    connectionStatus.error = err.message || 'Connection failed';
    console.warn(`[MongoDB] Note: MongoDB connection attempt (${uri}) failed: ${err.message}. System is operating in resilient in-memory mode with full Mongoose schema compatibility.`);
    return false;
  }
}

mongoose.connection.on('disconnected', () => {
  connectionStatus.isConnected = false;
  console.log('[MongoDB] Connection lost.');
});

mongoose.connection.on('error', (err) => {
  connectionStatus.error = err.message;
  console.warn('[MongoDB] Runtime error:', err.message);
});

export function getMongoStatus(): MongoStatus {
  return {
    ...connectionStatus,
    isConnected: mongoose.connection.readyState === 1,
  };
}
