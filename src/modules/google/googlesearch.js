import keys from '../../cfg/opendoors';
import google from 'googleapis';
const googleAPIKey = keys.googleAPIKey;
const customsearch = google.customsearch('v1');
const urlshortener = google.urlshortener('v1');
const Entities = require('html-entities').AllHtmlEntities;

/**
 * googlesearch() returns the top Google search result for a query
 * @param {Object} message represents the data of the input message
 * @return {String}
 */
export function googlesearch(message) {
  const query = message.content.replace('.g ', '');

  return new Promise((resolve, reject) => {
    // async
    customsearch.cse.list({
      cx: keys.googleCX,
      q: query,
      auth: keys.googleAPIKey,
    }, (error, response) => {
      if (error) {
        console.log(`GOOGLE SEARCH -- ${error}`);
        reject(error);
        return;
      }

      if (!response.searchInformation.formattedTotalResults) {
        resolve('No results found!');
      } else if (response.items && response.items.length) {
        const searchResults = `https://www.google.com/?gws_rd=ssl#q=${query.replace(/ /g, '+')}`;

        // shorten search results url
        urlshortener.url.insert({
          resource: {
            longUrl: searchResults,
          },
          auth: googleAPIKey,
        }, (err, result) => {
          const entities = new Entities();
          const title = entities.decode(response.items[0].title)
            .replace(/<(?:.|\n)*?>/gm, '')
            .replace(/\s+/g, ' ')
            .trim();
          const snippet = entities.decode(response.items[0].snippet)
            .replace(/<(?:.|\n)*?>/gm, '')
            .replace(/\s+/g, ' ')
            .trim();
          const {
            items: [{
              link: link,
            }],
          } = response;

          let results;
          if (err) {
            console.log(`URL SHORTENER -- ${err}`);
            results = searchResults;
          } else {
            results = result.id;
          }
          let content = `**\`${title}\`** - ${link}\n`;
          content += `\`\`\`\n${snippet}\n\`\`\`\nmore results: ${results}`;
          resolve(content);
        });
      }
    });
  });
}
