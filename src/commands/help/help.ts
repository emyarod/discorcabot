import botCommands from './commands';

// commandList() lists all available bot commands
export function commandList(): string {
  const commands = Object.keys(botCommands);
  return `Available commands:\n\`\`\`${commands.join('\n')}\`\`\`
    Type \`.help <command>\` for more information about a command!
    See more: https://github.com/emyarod/discorcabot/wiki/Commands
  `;
}

/**
 * help() provides more information on a given bot command
 * @param {Message} message - represents the data of the input message
 */
export function help(content: string): string {
  const command = content.replace('.help ', '');
  return botCommands[command] || `\`${command}\` is not a valid command!`;
}
