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

const cooldowns: Collection<
  string,
  Collection<string, number>
> = new Collection();

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

  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Collection());
  }

  const now = Date.now();
  const timestamps: Collection<string, number> =
    cooldowns.get(command.name) || new Collection();
  const cooldownAmount = (command.cooldown || 3) * 1000;

  if (!timestamps.has(message.author.id)) {
    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
  } else {
    const expirationTime =
      (timestamps.get(message.author.id) || 0) + cooldownAmount;
    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      const timeLeftFixed = timeLeft.toFixed(1);
      return message.reply(
        `please wait ${timeLeftFixed} more ${
          timeLeftFixed === '1' ? 'second' : 'seconds'
        } before reusing the \`${command.name}\` command.`
      );
    }

    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
  }

  try {
    return command.execute(message, args);
  } catch (error) {
    console.error(error);
    return message.reply('there was an error trying to execute that command!');
  }
});
