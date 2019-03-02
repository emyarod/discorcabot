import { Message, RichEmbed } from 'discord.js';
import { customsearch_v1, google } from 'googleapis';
import { googleAPIKey, googleCX } from '../../cfg/opendoors';

const search = async ({
  options,
  query,
  message,
}: {
  options: customsearch_v1.Params$Resource$Cse$List;
  query: string;
  message: Message;
}) => {
  const customsearch = google.customsearch('v1');
  const { data: response } = await customsearch.cse.list(options);
  if (!response.items || !response.searchInformation) {
    return message.reply('No search results found!');
  }
  const searchResults = `https://www.google.com/search?q=${query.replace(
    / /g,
    '+'
  )}`;
  const topResult = response.items[0];
  const googleSearchEmbed = new RichEmbed()
    .setColor('#0099ff')
    .setTitle(topResult.title)
    .setURL(topResult.link || '')
    .setAuthor(
      `Google Search - ${query}`,
      'https://www.google.com/favicon.ico',
      searchResults
    )
    .setDescription(topResult.snippet)
    .addField('View all results', searchResults)
    .setFooter(
      `About ${response.searchInformation.formattedTotalResults} results (${
        response.searchInformation.formattedSearchTime
      } seconds)`,
      'https://www.google.com/favicon.ico'
    )
    .setTimestamp();
  return message.channel.send(googleSearchEmbed);
};

export default {
  name: 'google',
  description: 'Perform a Google search and return the top search result',
  aliases: ['g'],
  usage: '<query>',
  cooldown: 5,
  execute: (message: Message, args: string[]) => {
    const query = args.join(' ');
    const options: customsearch_v1.Params$Resource$Cse$List = {
      cx: googleCX,
      q: query,
      auth: googleAPIKey,
    };

    return search({ options, query, message }).catch(console.error);
  },
};
