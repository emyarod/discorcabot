/**
 * commandList() lists all available bot commands
 * @return {String} list of all available commands
 */
export function commandList() {
  const commands = [
    'addlfm',
    'charts',
    'dj',
    'getinfo',
    'ig',
    'np',
    'similar',
    'tr',
    'tw',
    'yt',
  ];

  let list = 'Available commands:\n';
  list += '```\n';
  commands.forEach((element) => {
    list += `${element}\n`;
  }, this);

  list += '```\n';
  list += ' Type `.help <command>` for more information about a command!';
  list += ' See more: https://github.com/emyarod/discorcabot/wiki/Commands';
  return list;
}

/**
 * help() provides more information on a given bot command
 * @param {Object} message represents the data of the input message
 * @return {String} command description
 */
export function help(message) {
  const command = message.content.replace('.help ', '');
  let reply = '';
  switch (true) {
    case (command === 'addlfm'):
      reply += '**Last.fm module!** Usage: ';
      reply += '`.addlfm <username>` stores your Discord ID and Last.fm username';
      reply += ' in the bot\'s database for usage with the `.np` and `.charts` commands.';
      break;

    case (command === 'charts'):
      reply += '**Last.fm module!** Usage: ';
      reply += '`.charts` (with no other parameters) returns your top five most played artists';
      reply += ' in the last seven days on Last.fm';
      reply += ' (you must be in the bot\'s database for this function to work!).';
      reply += ' Entering .charts <username> returns this data for the provided user on Last.fm.';
      break;

    case (command === 'dj'):
      reply += '**Turntable module!** Usage: ';
      reply += 'The turntable module allows everyone in a voice channel to';
      reply += ' interactively share and listen to music.';
      reply += ' For all of the turntable commands, refer to the bot wiki: ';
      reply += 'https://github.com/emyarod/discorcabot/wiki/Commands#turntable-module';
      break;

    case (command === 'getinfo'):
      reply += '**Last.fm module!** Usage: ';
      reply += '`.getinfo <artist>` returns a short description of the given artist';
      break;

    case (command === 'ig'):
      reply += '**Instagram module!** Usage: ';
      reply += '.ig <username> will return this user\'s most recent photo/video,';
      reply += ' along with the caption (if applicable).';
      break;

    case (command === 'np'):
      reply += '**Last.fm module!** Usage: ';
      reply += '`.np [@Discord user | Last.fm handle]` returns the currently playing';
      reply += ' or most recently scrobbled track on the associated Last.fm account.';
      reply += ' If no argument is provided, the bot will look up its local database';
      reply += ' to see if the command caller is linked to a Last.fm account,';
      reply += ' and then fetch the data from Last.fm.';
      break;

    case (command === 'similar'):
      reply += '**Last.fm module!** Usage: ';
      reply += '`.similar <artist>` returns a list of similar artists as well as';
      reply += ' a percentage value of how closely the artists match, according to Last.fm.';
      break;

    case (command === 'tr'):
      reply += '**Translation module!** Usage: ';
      reply += '`.tr <input language code>:<output language code> <text to translate>`\n';
      reply += '`.tr auto[:output language code] <text to translate>`\n';
      reply += '`.tr <text to translate>`\n';
      reply += 'Translates the input text into the output language of choice.';
      reply += ' If the output language is not specified, the translator defaults to English.';
      reply += ' For the full list of languages supported, see http://aegyo.me/xmS';
      break;

    case (command === 'tw'):
      reply += '**Twitter module!** Usage: ';
      reply += '`.tw <username>` will return this user\'s most recent tweet.';
      break;

    case (command === 'yt'):
      reply += '**YouTube module!** Usage: ';
      reply += '`.yt <query>` will return the top search result for `<query>`,';
      reply += 'along with relevant video information and a link to more search results.';
      break;

    default:
      return `\`${command}\` is not a valid command!`;
  }

  return reply;
}
