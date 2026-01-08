// Initialize scheduler when the app starts
import { startScheduler } from './scheduler';
import { initDatabase } from './db';

let initialized = false;

export async function initializeScheduler() {
  if (initialized) {
    return;
  }

  try {
    await initDatabase();
    await startScheduler();
    initialized = true;
    console.log('Scheduler initialized');
  } catch (error) {
    console.error('Failed to initialize scheduler:', error);
  }
}

// Auto-initialize in production
if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
  initializeScheduler();
}

