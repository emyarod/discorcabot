import keys from '../../cfg/opendoors';
import google from 'googleapis';
import moment from 'moment';
const googleAPIKey = keys.googleAPIKey;
const urlshortener = google.urlshortener('v1');
const youtube = google.youtube('v3');

export function searchYouTube(orcabot, message) {
  const ytSearch = message.content.replace('.yt ', '');
  let searchResults;

  urlshortener.url.insert({
    resource: {
      longUrl: `https://www.youtube.com/results?search_query=${ytSearch}`
    },
    auth: googleAPIKey
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
    q: ytSearch
  }, (err, data) => {
    if (!err) {
      switch (true) {
        case data.pageInfo.totalResults === 0:
          // no results from query
          orcabot.reply(message, 'No results found!');
          break;
        default:
          // top search result = data.items[0]
          const {
            items: [{
              id: {
                videoId: videoID
              }
            }]
          } = data;

          // get video info
          youtube.videos.list({
            auth: googleAPIKey,
            part: 'snippet, contentDetails, status, statistics',
            id: videoID
          }, (err, data) => {
            if (!err) {
              const {
                items: [{
                  snippet: {
                    title: videoTitle
                  }
                }]
              } = data;

              const {
                items: [{
                  snippet: {
                    channelTitle: channelName
                  }
                }]
              } = data;

              let {
                items: [{
                  statistics: {
                    viewCount: viewCount
                  }
                }]
              } = data;

              // add commas to mark every third digit
              viewCount = `\`${viewCount.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} views\``;

              // parse ISO 8601 duration
              let {
                items: [{
                  contentDetails: {
                    duration: duration
                  }
                }]
              } = data;

              duration = moment.duration(duration, moment.ISO_8601).asSeconds();

              // conversion because moment.js cannot convert from duration to h:m:s format
              function getHours(timeInSeconds) {
                return Math.floor(timeInSeconds / 3600);
              }

              function getMinutes(timeInSeconds) {
                return Math.floor(timeInSeconds / 60);
              }

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
              if (data.items[0].contentDetails.contentRating !== undefined) {
                contentRating = '**\`[NSFW]\`**';
              }

              const url = `https://youtu.be/${videoID}`;
              const content = `${contentRating} \`${videoTitle}\` by \`${channelName}\` | ${viewCount} | \`${duration}\` | ${url} | ${searchResults}`;
              orcabot.reply(message, content);
            } else {
              console.warn(`YOUTUBE GET VIDEO INFO -- ${err}`);
              orcabot.reply(message, err);
            }
          });
          break;
      }
    } else {
      console.warn(`YOUTUBE SEARCH -- ${err}`);
    }
  });
}
