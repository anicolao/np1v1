import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Environment configuration interface
 */
export interface Config {
  discord: {
    token: string;
    clientId: string;
    guildId?: string;
  };
  database: {
    uri: string;
  };
  app: {
    nodeEnv: string;
    logLevel: string;
    commandPrefix: string;
  };
}

/**
 * Validates required environment variables
 */
function validateConfig(): Config {
  const requiredVars = ['DISCORD_TOKEN', 'DISCORD_CLIENT_ID', 'MONGODB_URI'];
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  const config: Config = {
    discord: {
      token: process.env.DISCORD_TOKEN!,
      clientId: process.env.DISCORD_CLIENT_ID!,
    },
    database: {
      uri: process.env.MONGODB_URI!,
    },
    app: {
      nodeEnv: process.env.NODE_ENV || 'development',
      logLevel: process.env.LOG_LEVEL || 'info',
      commandPrefix: process.env.COMMAND_PREFIX || '/',
    },
  };

  // Add guildId only if it exists
  if (process.env.GUILD_ID) {
    config.discord.guildId = process.env.GUILD_ID;
  }

  return config;
}

/**
 * Application configuration
 */
export const config = validateConfig();