import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';

/**
 * Base interface for slash commands
 */
export interface SlashCommand {
  data: SlashCommandBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}