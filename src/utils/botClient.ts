import { Client, Collection, GatewayIntentBits, Events, REST, Routes } from 'discord.js';
import { logger } from '../utils/logger.js';
import { DiscordError } from '../utils/errorHandler.js';
import { config } from '../config/config.js';
import { CommandLoader } from '../utils/commandLoader.js';
import { SlashCommand } from '../types/commands.js';

/**
 * Extended Discord client with command collection
 */
export class BotClient extends Client {
  public commands: Collection<string, SlashCommand>;
  private commandLoader: CommandLoader;

  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });

    this.commands = new Collection();
    this.commandLoader = new CommandLoader();
  }

  /**
   * Initialize the bot client
   */
  async initialize(): Promise<void> {
    try {
      // Load commands
      this.commands = this.commandLoader.loadCommands();

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
    this.once(Events.ClientReady, async (client) => {
      logger.info(`Logged in as ${client.user?.tag || 'Unknown'}`);
      logger.info(`Bot is ready and serving ${client.guilds.cache.size} guilds`);
      
      // Register slash commands
      await this.registerSlashCommands();
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

      const command = this.commands.get(interaction.commandName);

      if (!command) {
        logger.warn('Unknown command received', {
          command: interaction.commandName,
          user: interaction.user.tag,
          guild: interaction.guild?.name || 'DM',
        });
        
        await interaction.reply({
          content: 'Unknown command. Please try again.',
          ephemeral: true,
        });
        return;
      }

      logger.debug('Executing slash command', {
        command: interaction.commandName,
        user: interaction.user.tag,
        guild: interaction.guild?.name || 'DM',
      });

      try {
        await command.execute(interaction);
      } catch (error) {
        logger.error('Error executing command', {
          command: interaction.commandName,
          error: error instanceof Error ? error.message : String(error),
          user: interaction.user.tag,
          guild: interaction.guild?.name || 'DM',
        });

        const errorMessage = 'There was an error executing this command.';
        
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: errorMessage, ephemeral: true });
        } else {
          await interaction.reply({ content: errorMessage, ephemeral: true });
        }
      }
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
   * Register slash commands with Discord
   */
  private async registerSlashCommands(): Promise<void> {
    try {
      logger.info('Registering slash commands with Discord...');

      const rest = new REST().setToken(config.discord.token);
      const commandData = this.commandLoader.getCommandData();

      if (config.discord.guildId) {
        // Register commands for specific guild (faster for development)
        await rest.put(
          Routes.applicationGuildCommands(config.discord.clientId, config.discord.guildId),
          { body: commandData }
        );
        logger.info(`Successfully registered ${commandData.length} guild commands for development`);
      } else {
        // Register commands globally (takes up to 1 hour to propagate)
        await rest.put(
          Routes.applicationCommands(config.discord.clientId),
          { body: commandData }
        );
        logger.info(`Successfully registered ${commandData.length} global commands`);
      }
    } catch (error) {
      logger.error('Failed to register slash commands', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new DiscordError('Failed to register slash commands');
    }
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