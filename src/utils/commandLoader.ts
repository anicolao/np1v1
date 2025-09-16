import { Collection } from 'discord.js';
import { SlashCommand } from '../types/commands.js';
import { logger } from './logger.js';

// Import all commands
import { versionCommand } from '../commands/version.js';

/**
 * Command loader utility for managing slash commands
 */
export class CommandLoader {
  private commands: Collection<string, SlashCommand>;

  constructor() {
    this.commands = new Collection();
  }

  /**
   * Load all commands into the collection
   */
  loadCommands(): Collection<string, SlashCommand> {
    logger.info('Loading slash commands...');

    // Add all commands here
    const commandList = [
      versionCommand,
    ];

    for (const command of commandList) {
      this.commands.set(command.data.name, command);
      logger.debug(`Loaded command: ${command.data.name}`);
    }

    logger.info(`Successfully loaded ${this.commands.size} commands`);
    return this.commands;
  }

  /**
   * Get command data for registration with Discord
   */
  getCommandData(): any[] {
    return Array.from(this.commands.values()).map(command => command.data.toJSON());
  }
}