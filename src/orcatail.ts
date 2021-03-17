import { Collection, Message } from 'discord.js';
import * as fs from 'fs';
import * as path from 'path';
import orcabot from '../cfg/config';
import { prefix } from '../cfg/opendoors';
import { Command } from './types';

const cooldowns: Collection<
  string,
  Collection<string, number>
> = new Collection();

orcabot.on('ready', () => {
  console.log('Ready!');
});

const commands: Collection<string, Command> = new Collection();
orcabot.commands = commands;
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

  // // nfz
  // modules.flex(orcabot, message);

  // const words = message.content.match(/((?:[a-z][a-z0-9_]*))/gi);
  // if (words) {
  //   modules.matchEmotes(words).then(emotes => {
  //     emotes.forEach(element => {
  //       const [filename] = Object.keys(element);
  //       const imageURL = element[filename];
  //       orcabot.sendFile(message, imageURL, `${filename}.png`, null, (error) => {
  //         if (error) {
  //           orcabot.reply(
  //             message,
  //             'There was an error resolving your request!'
  //           );
  //         }
  //       });
  //     });
  //   });
  // }

  // if (!message.content.search(/^(\.dj )/gi) && message.content !== '.dj ') {
  //   // turntable
  //   modules.turntable(orcabot, message);
  //   return;
  // }

  // // non-turntable modules
  // const moduleSwitch = new Promise((resolve, reject) => {
  //   switch (true) {
  //     case !message.content.search(/^(\.tw )/gi):
  //       // Twitter
  //       modules
  //         .twitter(message)
  //         .then(response => resolve(response), error => reject(error));
  //       break;

  //     case !message.content.search(/^(\.similar )/gi):
  //       // Last.fm get similar artists
  //       modules
  //         .getSimilarArtists(message)
  //         .then(response => resolve(response), error => reject(error));
  //       break;

  //     case !message.content.search(/^(\.getinfo )/gi):
  //       // Last.fm get artist info
  //       modules
  //         .getArtistInfo(message)
  //         .then(response => resolve(response), error => reject(error));
  //       break;

  //     case !message.content.search(/^(\.addlfm )/gi):
  //       // Last.fm add lfm username to db
  //       modules
  //         .addlfm(message)
  //         .then(response => resolve(response), error => reject(error));
  //       break;

  //     case !message.content.search(/^(\.np)/gi):
  //       // Last.fm now playing .np <self/user/registered handle>
  //       modules
  //         .nowplaying(message)
  //         .then(response => resolve(response), error => reject(error));
  //       break;

  //     case !message.content.search(/^(\.charts)/gi):
  //       // Last.fm weekly charts .charts <self/user/registered handle>
  //       modules
  //         .getWeeklyCharts(message)
  //         .then(response => resolve(response), error => reject(error));
  //       break;

  //     case !message.content.search(/^(\.yt )/gi) && message.content !== '.yt ':
  //       // YouTube
  //       modules
  //         .searchYouTube(message)
  //         .then(response => resolve(response), error => reject(error));
  //       break;

  //     case !message.content.search(/^(\.tr )/gi):
  //       // translator
  //       modules
  //         .textTranslate(message)
  //         .then(response => resolve(response), error => reject(error));
  //       break;

  //     default:
  //       // default
  //       break;
  //   }
  // });
});
