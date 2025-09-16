import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { SlashCommand } from '../types/commands.js';
import { logger } from '../utils/logger.js';

/**
 * Version command - displays the current bot version
 */
export const versionCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('version')
    .setDescription('Display the current bot version'),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      logger.debug('Version command executed', {
        user: interaction.user.tag,
        guild: interaction.guild?.name || 'DM',
      });

      const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('🤖 NP 1v1 League System')
        .setDescription('Tournament and league management bot')
        .addFields(
          { name: '📦 Version', value: '`0.1.0`', inline: true },
          { name: '🚀 Status', value: '`Alpha - Section 1.1 Complete`', inline: true },
          { name: '🛠️ Built with', value: '`Discord.js, TypeScript, MongoDB`', inline: true }
        )
        .setFooter({ text: 'NP 1v1 League System' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

      logger.info('Version command completed successfully', {
        user: interaction.user.tag,
        guild: interaction.guild?.name || 'DM',
      });
    } catch (error) {
      logger.error('Error executing version command', {
        error: error instanceof Error ? error.message : String(error),
        user: interaction.user.tag,
        guild: interaction.guild?.name || 'DM',
      });

      // Try to respond with error message
      const errorMessage = 'An error occurred while executing the version command.';
      
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: errorMessage, ephemeral: true });
      } else {
        await interaction.reply({ content: errorMessage, ephemeral: true });
      }
    }
  },
};