import keys from '../../cfg/opendoors';
import request from 'request';
import google from 'googleapis';

export function musicSearch(orcabot, message, service, query) {
  const platform = service.toLowerCase();
  const userID = message.author.id;

  if (platform === 'yt' || platform === 'youtube') {
    // search YouTube
    const googleAPIKey = keys.googleAPIKey;
    const youtube = google.youtube('v3');
    return new Promise((resolve, reject) => {
      // YouTube API search request
      youtube.search.list({
        auth: googleAPIKey,
        maxResults: 10,
        part: 'snippet',
        q: query,
        type: 'video',
      }, (err, searchList) => {
        if (!err) {
          if (!searchList.pageInfo.totalResults) {
            // no results from query
            reject('No results found!');
          } else {
            // collect search results
            const results = [];
            for (let i = 0; i < searchList.items.length; i++) {
              const element = searchList.items[i];
              results.push({
                title: element.snippet.title,
                videoID: element.id.videoId,
              });
            }

            // format search results in code block
            let resultsList = '```';
            results.forEach((element, index) => {
              resultsList += `\n${index + 1}. "${element.title}"`;
            });

            resultsList += '\n```';
            orcabot.reply(message, `Select from the following search results:\n${resultsList}`);

            // prompt user for video choice
            const getUserSelection = new Promise((fulfilled) => {
              // console.log('asdf');
              const validateSelection = (response) => {
                // check if response author ID matches original search query author ID
                if (response.author.id === userID) {
                  // check for integer at beginning of user response
                  if (!response.content.search(/^(\d+)/)) {
                    const [choice] = response.content.match(/^(\d+)/);
                    if (results[choice - 1] !== undefined) {
                      // return user's video choice
                      orcabot.removeListener('message', validateSelection);
                      fulfilled(results[choice - 1]);
                    } else {
                      orcabot.reply(response, 'Enter a valid number to make your selection!');
                    }
                  }
                }
              };

              // event listener for messages to catch user's video choice
              orcabot.on('message', validateSelection);
            });

            // TODO: document
            // @param: selection{object} contains title and YouTube videoID
            getUserSelection.then((selection) => {
              // get video info
              youtube.videos.list({
                auth: googleAPIKey,
                part: 'snippet, contentDetails, status, statistics',
                id: selection.videoID,
              }, (error) => {
                if (!error) {
                  const url = `https://youtu.be/${selection.videoID}`;
                  resolve(url);
                } else {
                  console.warn(`TT SEARCH YOUTUBE GET VIDEO INFO -- ${error}`);
                  orcabot.reply(message, error);
                  reject(error);
                }
              });
            });
          }
        } else {
          console.warn(`TT SEARCH YOUTUBE SEARCH -- ${err}`);
          reject(err);
        }
      });
    });
  } else if (platform === 'sc' || platform === 'soundcloud') {
    // search SoundCloud
    return new Promise((resolve, reject) => {
      const requestURL = `http://api.soundcloud.com/tracks.json?q=${query}&client_id=${keys.scClientID}`;

      // make call to SoundCloud API
      request(requestURL, (error, response, body) => {
        if (!error && response.statusCode === 200) {
          const data = JSON.parse(body);

          // make sure there are results
          if (!data.length) {
            reject('No results found!');
          } else {
            // collect search results
            const results = [];
            for (let i = 0; i < data.length; i++) {
              const element = data[i];
              const artist = element.user.username;
              const title = element.title;
              const permalink = element.permalink_url;
              results.push({
                artist,
                title,
                permalink,
              });
            }

            // format search results in code block
            let resultsList = '```';
            results.forEach((element, index) => {
              resultsList += `\n${index + 1}. ${element.artist} - "${element.title}"`;
            });

            resultsList += '\n```';
            orcabot.reply(message, `Select from the following search results:\n${resultsList}`);

            // prompt user for video choice
            const getUserSelection = new Promise((fulfilled) => {
              // console.log('asdf');
              const validateSelection = (userResponse) => {
                // check if response author ID matches original search query author ID
                if (userResponse.author.id === userID) {
                  // check for integer at beginning of user response
                  if (!userResponse.content.search(/^(\d+)/)) {
                    const [choice] = userResponse.content.match(/^(\d+)/);
                    if (results[choice - 1] !== undefined) {
                      // return user's video choice
                      orcabot.removeListener('message', validateSelection);
                      fulfilled(results[choice - 1]);
                    } else {
                      orcabot.reply(userResponse, 'Enter a valid number to make your selection!');
                    }
                  }
                }
              };

              // event listener for messages to catch user's video choice
              orcabot.on('message', validateSelection);
            });

            getUserSelection.then((selection) => {
              resolve(selection.permalink);
            });
          }
        } else {
          orcabot.reply(message, 'There was an error with your request!');
          console.log(`TT SEARCH SOUNDCLOUD SEARCH LOADER -- ${error}`);
          console.log(error);
        }
      });
    });
  }
}
