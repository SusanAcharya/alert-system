import { startScheduler } from '../lib/scheduler';
import { initDatabase } from '../lib/db';

async function main() {
  console.log('Initializing database...');
  await initDatabase();
  console.log('Database initialized');
  
  console.log('Starting scheduler...');
  await startScheduler();
  console.log('Scheduler is running. Press Ctrl+C to stop.');
}

main().catch(console.error);

// Keep the process alive
process.on('SIGINT', () => {
  console.log('\nShutting down scheduler...');
  process.exit(0);
});

