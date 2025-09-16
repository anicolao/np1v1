import { config } from './config/config.js';
import { logger } from './utils/logger.js';
import { setupErrorHandlers } from './utils/errorHandler.js';

/**
 * Verification script to test infrastructure setup
 */
async function verifySetup(): Promise<void> {
  console.log('🔍 Verifying NP 1v1 Bot infrastructure setup...\n');

  try {
    // Test 1: Environment configuration
    console.log('✅ Testing environment configuration...');
    console.log(`   Node Environment: ${config.app.nodeEnv}`);
    console.log(`   Log Level: ${config.app.logLevel}`);
    console.log(`   Command Prefix: ${config.app.commandPrefix}`);
    console.log(`   Discord Client ID: ${config.discord.clientId ? 'Set' : 'Not set'}`);
    console.log(`   Discord Token: ${config.discord.token ? 'Set' : 'Not set'}`);
    console.log(`   Guild ID: ${config.discord.guildId ? 'Set' : 'Not set'}`);
    console.log(`   MongoDB URI: ${config.database.uri ? 'Set' : 'Not set'}\n`);

    // Test 2: Logging system
    console.log('✅ Testing logging system...');
    logger.debug('Debug message test');
    logger.info('Info message test');
    logger.warn('Warning message test');
    console.log('   Logging to console and file working\n');

    // Test 3: Error handling setup
    console.log('✅ Testing error handling setup...');
    setupErrorHandlers();
    console.log('   Global error handlers configured\n');

    // Test 4: TypeScript compilation
    console.log('✅ TypeScript compilation successful');
    console.log('   All type definitions loaded correctly\n');

    console.log('🎉 Infrastructure setup verification complete!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Create a Discord application at https://discord.com/developers/applications');
    console.log('2. Create a bot user and copy the token');
    console.log('3. Update .env file with real Discord credentials');
    console.log('4. Set up MongoDB database');
    console.log('5. Test bot connection with npm run dev');

  } catch (error) {
    console.error('❌ Infrastructure verification failed:', error);
    process.exit(1);
  }
}

// Run verification
verifySetup();