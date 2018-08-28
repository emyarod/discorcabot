/* tslint:disable:max-line-length */
// TODO: aliases
export default {
  // Instagram
  ig: `**Instagram module!** Usage: .ig <username> will return this user's most recent photo/video, along with the caption (if applicable).`,
  // 'Last.fm'
  addlfm: `**Last.fm module!** Usage: \`.addlfm <username>\` stores your Discord ID and Last.fm username in the bot's database for usage with the \`.np\` and \`.charts\` commands.`,
  charts: `**Last.fm module!** Usage: \`.charts\` (with no other parameters) returns your top five most played artists in the last seven days on Last.fm (you must be in the bot's database for this function to work!). Entering \`.charts <username>\` returns this data for the provided user on Last.fm.`,
  getinfo: `**Last.fm module!** Usage: \`.getinfo <artist>\` returns a short description of the given artist`,
  np: `**Last.fm module!** Usage: \`.np [@Discord user | Last.fm handle]\` returns the currently playing or most recently scrobbled track on the associated Last.fm account. If no argument is provided, the bot will look up its local database to see if the command caller is linked to a Last.fm account, and then fetch the data from Last.fm.`,
  similar: `**Last.fm module!** Usage: \`.similar <artist>\` returns a list of similar artists as well as a percentage value of how closely the artists match, according to Last.fm.`,
  // Microsoft translate
  tr: `**Translation module!** Usage: \`.tr <input language code>:<output language code> <text to translate>\`\n\`.tr auto[:output language code] <text to translate>\`\n\`.tr <text to translate>\`\nTranslates the input text into the output language of choice. If the output language is not specified, the translator defaults to English. For the full list of languages supported, see http://aegyo.me/xmS`,
  // turntable
  dj: `**Turntable module!** Usage: The turntable module allows everyone in a voice channel to interactively share and listen to music. For all of the turntable commands, refer to the bot wiki: https://github.com/emyarod/discorcabot/wiki/Commands#turntable-module`,
  // Twitter
  tw: `**Twitter module!** Usage: \`.tw <username>\` will return this user's most recent tweet.`,
  // YouTube
  yt: `**YouTube module!** Usage: \`.yt <query>\` will return the top search result for \`<query>\`along with relevant video information and a link to more search results.,`,
};
