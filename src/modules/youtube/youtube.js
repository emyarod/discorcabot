import keys from '../../cfg/opendoors';
import google from 'googleapis';
import moment from 'moment';
const googleAPIKey = keys.googleAPIKey;
const urlshortener = google.urlshortener('v1');
const youtube = google.youtube('v3');

/**
 * getHours() converts number of seconds to hours
 * because moment.js cannot convert from duration (in seconds) to h:m:s format
 * @param {Number} timeinSeconds video duration in seconds
 * @return {Number}
 */
function getHours(timeInSeconds) {
  return Math.floor(timeInSeconds / 3600);
}

/**
 * getMinutes() converts number of seconds to minutes
 * because moment.js cannot convert from duration (in seconds) to h:m:s format
 * @param {Number} timeinSeconds video duration in seconds
 * @return {Number}
 */
function getMinutes(timeInSeconds) {
  return Math.floor(timeInSeconds / 60);
}

/**
 * searchYouTube() returns the top YouTube search result for a query
 * @param {Object} message represents the data of the input message
 * @return {String}
 */
export function searchYouTube(message) {
  const ytSearch = message.content.replace('.yt ', '');
  let searchResults;

  return new Promise((resolve, reject) => {
    urlshortener.url.insert({
      resource: {
        longUrl: `https://www.youtube.com/results?search_query=${ytSearch}`,
      },
      auth: googleAPIKey,
    }, (err, result) => {
      if (err) {
        console.warn(`YOUTUBE URL SHORTENER -- ${err}`);
      } else {
        searchResults = `\`More results:\` ${result.id}`;
      }
    });

    // search YouTube
    youtube.search.list({
      auth: googleAPIKey,
      part: 'snippet',
      q: ytSearch,
    }, (err, data) => {
      if (!err) {
        switch (data.pageInfo.totalResults) {
          case 0:
            {
              // no results from query
              resolve('No results found!');
              break;
            }
          default:
            {
              // top search result = data.items[0]
              const { items: [{ id: { videoId: videoID } }] } = data;

              // get video info
              youtube.videos.list({
                auth: googleAPIKey,
                part: 'snippet, contentDetails, status, statistics',
                id: videoID,
              }, (e, result) => {
                if (!e) {
                  const { items: [{ snippet: { title: videoTitle } }] } = result;
                  const { items: [{ snippet: { channelTitle: channelName } }] } = result;
                  let { items: [{ statistics: { viewCount: viewCount } }] } = result;

                  // add commas to mark every third digit
                  viewCount = `\`${viewCount.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} views\``;

                  // parse ISO 8601 duration
                  let { items: [{ contentDetails: { duration: duration } }] } = result;
                  duration = moment.duration(duration, moment.ISO_8601).asSeconds();

                  // convert video duration from basic ISO-8601 to h:m:s
                  const hours = getHours(duration);
                  if (hours >= 1) {
                    // at least 1:00:00
                    duration = duration - (hours * 3600);
                    const minutes = getMinutes(duration);
                    if (minutes >= 1) {
                      // at least 1:01:00
                      const seconds = duration - (minutes * 60);
                      duration = `${hours}h ${minutes}m ${seconds}s`;
                    } else {
                      // between 1:00:00 and 1:01:00
                      duration = `${hours}h ${duration}s`;
                    }
                  } else {
                    // below 1:00:00
                    const minutes = getMinutes(duration);
                    if (minutes >= 1) {
                      // between 1:00 and 1:00:00
                      const seconds = duration - (minutes * 60);
                      duration = `${minutes}m ${seconds}s`;
                    } else {
                      // below 1:00
                      duration = `${duration}s`;
                    }
                  }

                  // find if video is age restricted
                  let contentRating = '';
                  if (result.items[0].contentDetails.contentRating) contentRating = '**`[NSFW]`**';
                  const url = `https://youtu.be/${videoID}`;
                  let content = `${contentRating} \`${videoTitle}\` by \`${channelName}\``;
                  content += ` | ${viewCount} | \`${duration}\` | ${url} | ${searchResults}`;
                  resolve(content);
                } else {
                  console.warn(`YOUTUBE GET VIDEO INFO -- ${e}`);
                  reject(e);
                }
              });
            }
        }
      } else {
        console.warn(`YOUTUBE SEARCH -- ${err}`);
      }
    });
  });
}
