import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  isFallback: boolean;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || {
  conn: null,
  promise: null,
  isFallback: false,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectDB(): Promise<{ isConnected: boolean; isFallback: boolean }> {
  if (!MONGODB_URI || MONGODB_URI.trim() === '') {
    cached.isFallback = true;
    return { isConnected: false, isFallback: true };
  }

  if (cached.conn) {
    return { isConnected: true, isFallback: false };
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 2500, // Fast failover to local store if MongoDB is down
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((m) => {
        cached.isFallback = false;
        return m;
      })
      .catch((err) => {
        console.warn('⚠️ MongoDB connection failed, activating resilient local fallback mode:', err.message);
        cached.isFallback = true;
        cached.promise = null;
        return null as unknown as typeof mongoose;
      });
  }

  try {
    cached.conn = await cached.promise;
    return { isConnected: !!cached.conn, isFallback: cached.isFallback };
  } catch {
    cached.isFallback = true;
    return { isConnected: false, isFallback: true };
  }
}

export function isUsingFallback(): boolean {
  return cached.isFallback || !MONGODB_URI;
}
