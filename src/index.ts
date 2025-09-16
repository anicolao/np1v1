import { logger } from './utils/logger.js';
import { setupErrorHandlers } from './utils/errorHandler.js';
import { BotClient } from './utils/botClient.js';
import { config } from './config/config.js';

/**
 * Main application class
 */
class NP1v1Bot {
  private client: BotClient;

  constructor() {
    this.client = new BotClient();
  }

  /**
   * Start the bot application
   */
  async start(): Promise<void> {
    try {
      logger.info('Starting NP 1v1 League System Bot...', {
        nodeEnv: config.app.nodeEnv,
        logLevel: config.app.logLevel,
        version: process.env.npm_package_version || '0.1.0',
      });

      // Setup global error handlers
      setupErrorHandlers();

      // Initialize Discord bot
      await this.client.initialize();

      logger.info('NP 1v1 Bot started successfully');
    } catch (error) {
      logger.error('Failed to start bot', { error });
      process.exit(1);
    }
  }

  /**
   * Stop the bot application
   */
  async stop(): Promise<void> {
    logger.info('Stopping NP 1v1 Bot...');
    
    try {
      await this.client.shutdown();
      logger.info('NP 1v1 Bot stopped successfully');
    } catch (error) {
      logger.error('Error stopping bot', { error });
    }
  }
}

/**
 * Application entry point
 */
async function main(): Promise<void> {
  const bot = new NP1v1Bot();

  // Graceful shutdown handlers
  process.on('SIGINT', async () => {
    await bot.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await bot.stop();
    process.exit(0);
  });

  // Start the bot
  await bot.start();
}

// Only run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    logger.error('Unhandled error in main', { error });
    process.exit(1);
  });
}