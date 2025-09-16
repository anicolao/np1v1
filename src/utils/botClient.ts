import { Client, Collection, GatewayIntentBits, Events } from 'discord.js';
import { logger } from '../utils/logger.js';
import { DiscordError } from '../utils/errorHandler.js';
import { config } from '../config/config.js';

/**
 * Extended Discord client with command collection
 */
export class BotClient extends Client {
  public commands = new Collection();

  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });
  }

  /**
   * Initialize the bot client
   */
  async initialize(): Promise<void> {
    try {
      // Set up event handlers
      this.setupEventHandlers();

      // Login to Discord
      await this.login(config.discord.token);
      
      logger.info('Discord bot initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Discord bot', { error });
      throw new DiscordError('Bot initialization failed');
    }
  }

  /**
   * Set up Discord event handlers
   */
  private setupEventHandlers(): void {
    // Bot ready event
    this.once(Events.ClientReady, (client) => {
      logger.info(`Logged in as ${client.user?.tag || 'Unknown'}`);
      logger.info(`Bot is ready and serving ${client.guilds.cache.size} guilds`);
    });

    // Error handling
    this.on(Events.Error, (error) => {
      logger.error('Discord client error', { error: error.message, stack: error.stack });
    });

    this.on(Events.Warn, (warning) => {
      logger.warn('Discord client warning', { warning });
    });

    // Interaction handling (for slash commands)
    this.on(Events.InteractionCreate, async (interaction) => {
      if (!interaction.isChatInputCommand()) return;

      logger.debug('Received slash command', {
        command: interaction.commandName,
        user: interaction.user.tag,
        guild: interaction.guild?.name || 'DM',
      });

      // TODO: Implement command handling in future phases
      await interaction.reply({
        content: 'Command functionality will be implemented in upcoming phases.',
        ephemeral: true,
      });
    });

    // Guild join/leave events for monitoring
    this.on(Events.GuildCreate, (guild) => {
      logger.info('Bot added to new guild', {
        guildName: guild.name,
        guildId: guild.id,
        memberCount: guild.memberCount,
      });
    });

    this.on(Events.GuildDelete, (guild) => {
      logger.info('Bot removed from guild', {
        guildName: guild.name,
        guildId: guild.id,
      });
    });
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    logger.info('Shutting down Discord bot...');
    
    try {
      this.destroy();
      logger.info('Discord bot shutdown complete');
    } catch (error) {
      logger.error('Error during bot shutdown', { error });
    }
  }
}