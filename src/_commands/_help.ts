import { Collection, Message } from 'discord.js';
import { prefix } from '../../cfg/opendoors';
import { Command } from '../types';

export default {
  name: 'help',
  description: 'List all of my commands or info about a specific command.',
  aliases: ['commands'],
  usage: '[command name]',
  cooldown: 5,
  execute(
    message: Message & { client: { commands: Collection<string, Command> } },
    args: string[]
  ) {
    const helpText = [];
    const { commands } = message.client;

    // general helpText
    if (!args.length) {
      helpText.push('Available commands:');
      helpText.push(commands.map((c: Command) => `\`${c.name}\``).join(', '));
      helpText.push(
        `\nYou can send \`${prefix}help <command>\` for more information about a command!`
      );

      return message.author
        .send(helpText, { split: true })
        .then(() => {
          if (message.channel.type === 'dm') {
            return;
          }
        })
        .catch(error => {
          console.error(
            `Could not send help DM to ${message.author.tag}.\n`,
            error
          );
          message.reply(
            `It seems like I can't DM you! do you have DMs disabled?`
          );
        });
    }

    // command specific helpText
    const name = args[0].toLowerCase();
    const command =
      commands.get(name) ||
      commands.find(c => c.aliases && c.aliases.includes(name));

    if (!command) {
      return message.reply('Invalid command!');
    }

    helpText.push(`**Name:** ${command.name}`);

    if (command.aliases) {
      helpText.push(`**Aliases:** ${command.aliases.join(', ')}`);
    }
    if (command.description) {
      helpText.push(`**Description:** ${command.description}`);
    }
    if (command.usage) {
      helpText.push(`**Usage:** ${prefix}${command.name} ${command.usage}`);
    }

    helpText.push(`**Cooldown:** ${command.cooldown || 3} second(s)`);

    return message.channel.send(helpText, { split: true });
  },
};
