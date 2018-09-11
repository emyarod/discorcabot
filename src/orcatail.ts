import { Collection, Message } from 'discord.js';
import * as fs from 'fs';
import * as path from 'path';
import orcabot, { prefix } from '../cfg/config';

interface Command {
  name: string;
  description: string;
  args?: boolean;
  guildOnly?: boolean;
  cooldown?: number;
  aliases: string[];
  execute: (message: Message, args?: object) => void;
}

orcabot.on('ready', () => {
  console.log('Ready!');
});

const commands: Collection<string, Command> = new Collection();
const commandFiles = fs
  .readdirSync(path.resolve(__dirname, '_commands'))
  .filter(file => file.endsWith('.ts'));

commandFiles.forEach(file => {
  const { default: command } = require(`./_commands/${file}`);
  commands.set(command.name, command);
});

orcabot.on('message', (message: Message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) {
    return;
  }

  const [inputCommand, ...args] = message.content
    .slice(prefix.length)
    .split(/ +/);
  const commandName = inputCommand.toLowerCase();
  const command =
    commands.get(commandName) ||
    commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

  if (!command) {
    return;
  }

  if (command.guildOnly && message.channel.type !== 'text') {
    return message.reply(`I can't execute that command inside DMs!`);
  }

  if (command.args && !args.length) {
    return message.reply(`you didn't provide any arguments!`);
  }

  try {
    return command.execute(message, args);
  } catch (error) {
    console.error(error);
    return message.reply('there was an error trying to execute that command!');
  }
});
