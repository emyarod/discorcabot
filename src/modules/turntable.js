import keys from '../cfg/opendoors';
import urlRegex from 'url-regex';
import request from 'request';
import youtubedl from 'youtube-dl';
import google from 'googleapis';

// TODO: implement radio/preset playlists
function radio() {}

// store tracks in currently selected (untitled) playlist
let queue = [];

// add track details to current queue
function loader(message, streamURL, title, artist = null, platform = null) {
  queue.push({
    'artist': artist,
    'title': title,
    'streamURL': streamURL,
    'platform': platform,
    'message': message,
  });
}

// play top track from queue to voice channel
function player(orcabot) {
  // stop if queue is empty
  if (queue.length === 0) {
    return;
  }

  // check if a track is already playing
  if (!orcabot.voiceConnection.playing) {
    const [track] = queue;

    // begin playback from start of queue
    orcabot.voiceConnection.playFile(track.streamURL, {
      volume: 1,
    }, (error, streamIntent) => {
      if (error) {
        console.log(`MUSIC PLAYER -- ${error}`);
        console.log(error);
      }

      // announce currently playing track
      switch (track.platform) {
        case 'soundcloud':
          // SoundCloud
          orcabot.reply(track.message, `Now playing: \`${track.title}\` by \`${track.artist}\``);
          break;

        default:
          // ytdl
          orcabot.reply(track.message, `Now playing: \`${track.title}\``);
          break;
      }

      // update queue on playback finish
      streamIntent.on('end', () => {
        console.log('finished!!');
        queue.shift();
        console.log(queue);

        // recursive call
        player(orcabot);
      });
    });
  }
}

// request and load SoundCloud tracks or playlists
function soundcloud(orcabot, message, songURL, arg) {
  // SoundCloud loader
  function scLoader(orcabot, message, track) {
    const artist = track.user.username;
    const title = track.title;
    const streamURL = `${track.stream_url}?client_id=${keys.scClientID}`;

    // add track details to current queue
    loader(message, streamURL, title, artist, 'soundcloud');
  }

  // TODO: possible cleanup
  function singleTrackLoader(orcabot, message, track) {
    // load track into queue
    scLoader(orcabot, message, track);

    // announce queue additions
    const artist = track.user.username;
    const title = track.title;
    orcabot.reply(message, `Added \`${title}\` by \`${artist}\` to the queue!`);
  }

  if (arg === 'link') {
    const requestURL = `http://api.soundcloud.com/resolve.json?url=${songURL}&client_id=${keys.scClientID}`;

    // make call to SoundCloud API
    request(requestURL, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        const track = JSON.parse(body);
        const kind = track.kind;

        // SoundCloud playlist/track handling
        if (kind === 'track') {
          singleTrackLoader(orcabot, message, track);
        } else if (kind === 'playlist') {
          // load each track from playlist into queue
          for (let i = 0; i < track.tracks.length; i++) {
            const playlistTrack = track.tracks[i];
            scLoader(orcabot, message, playlistTrack);
          }

          // announce queue additions
          const playlistTitle = track.title;
          orcabot.reply(message, `Added playlist \`${playlistTitle}\` to the queue!`);
        }

        // play top track from queue to voice channel
        player(orcabot);
      } else {
        orcabot.reply(message, 'There was an error with your request!');
        console.log(`SOUNDCLOUD LOADER -- ${error}`);
        console.log(error);
      }
    });
  } else if (arg === 'search') {
    // fetch top SoundCloud search result
    const searchTerm = songURL;
    const requestURL = `http://api.soundcloud.com/tracks.json?q=${searchTerm}&client_id=${keys.scClientID}`;

    // make call to SoundCloud API
    request(requestURL, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        const [track] = JSON.parse(body);
        singleTrackLoader(orcabot, message, track);

        // play top track from queue to voice channel
        player(orcabot);
      } else {
        orcabot.reply(message, 'There was an error with your request!');
        console.log(`SOUNDCLOUD SEARCH LOADER -- ${error}`);
        console.log(error);
      }
    });
  }
}

// request and load YouTube tracks or playlists
function ytdl(orcabot, message, songURL, platform = null) {
  // YouTube loader
  function ytdlLoader(orcabot, message, track) {
    const title = track.title;
    const streamURL = track.url;

    // add track details to current queue
    loader(message, streamURL, title, 'ytdl');
  }

  // set options based on service platform
  let options = null;
  if (platform === 'youtube') {
    options = ['-f bestaudio'];
  }

  youtubedl.getInfo(songURL, options, (error, info) => {
    if (error) {
      orcabot.reply(message, 'There was an error with your request!');
      console.log(`YOUTUBE LOADER -- ${error}`);
      console.log(error);
    }

    // handler for individual tracks vs playlists
    const kind = info.playlist;
    if (kind === null) {
      // load track into queue
      ytdlLoader(orcabot, message, info);

      // announce queue additions
      const title = info.title;
      orcabot.reply(message, `Added \`${title}\` to the queue!`);
    } else if (kind === undefined) {
      // load each track from playlist into queue
      for (let i = 0; i < info.length; i++) {
        const playlistTrack = info[i];
        ytdlLoader(orcabot, message, playlistTrack);
      }

      // announce queue additions
      const [{
        playlist_title: playlistTitle
      }] = info;
      orcabot.reply(message, `Added playlist \`${playlistTitle}\` to the queue!`);
    }

    // play top track from queue to voice channel
    player(orcabot);
  });
}

// fetch top YouTube search result
function ytImFeelingLucky(orcabot, message, searchTerm) {
  const googleAPIKey = keys.googleAPIKey;
  const youtube = google.youtube('v3');

  return new Promise((resolve, reject) => {
    // YouTube API search request
    youtube.search.list({
      auth: googleAPIKey,
      part: 'snippet',
      q: searchTerm,
    }, (err, data) => {
      if (!err) {
        if (!data.pageInfo.totalResults) {
          // no results from query
          orcabot.reply(message, 'No results found!');
        } else {
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
              const url = `https://youtu.be/${videoID}`;
              resolve(url);
            } else {
              console.warn(`TT YOUTUBE GET VIDEO INFO -- ${err}`);
              orcabot.reply(message, err);
              reject(err);
            }
          });
        }
      } else {
        console.warn(`TT YOUTUBE SEARCH -- ${err}`);
      }
    });
  });
}

function musicSearch(orcabot, message, service, query) {
  const platform = service.toLowerCase();
  const userID = message.author.id;

  // prompt user for video choice
  const results = [];
  const getUserSelection = new Promise((fulfilled, rejected) => {
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
      }, (err, data) => {
        if (!err) {
          if (!data.pageInfo.totalResults) {
            // no results from query
            orcabot.reply(message, 'No results found!');
          } else {
            // collect search results
            for (let i = 0; i < data.items.length; i++) {
              const element = data.items[i];
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

            // TODO: document
            // @param: selection{object} contains title and YouTube videoID
            getUserSelection.then((selection) => {
              // get video info
              youtube.videos.list({
                auth: googleAPIKey,
                part: 'snippet, contentDetails, status, statistics',
                id: selection.videoID,
              }, (error, data) => {
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

          // collect search results
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

          getUserSelection.then((selection) => {
            resolve(selection.permalink);
          });
        } else {
          orcabot.reply(message, 'There was an error with your request!');
          console.log(`TT SEARCH SOUNDCLOUD SEARCH LOADER -- ${error}`);
          console.log(error);
        }
      });
    });
  }
}

// print queue when prompted
function printQueue(orcabot, message) {
  if (queue.length === 0) {
    orcabot.reply(message, 'The queue is currently empty!');
  } else {
    // enclose list in code block
    let list = '```\n';

    // append track details to list based on media platform
    for (let i = 0; i < queue.length; i++) {
      const track = queue[i];

      // output switch for platforms
      switch (track.platform) {
        case 'soundcloud':
          // SoundCloud
          list += `${track.artist} - "${track.title}"\n`;
          break;

        default:
          list += `"${track.title}"\n`;
          break;
      }
    }

    list += '```';
    orcabot.reply(message, `Songs currently in the queue:\n${list}`);
  }
}

// return currently playing track
function announceNowPlaying(orcabot, message) {
  const [track] = queue;
  switch (track.platform) {
    case 'soundcloud':
      // SoundCloud
      orcabot.reply(message, `Currently playing: \`${track.title}\` by \`${track.artist}\``);
      break;

    default:
      orcabot.reply(message, `Currently playing: \`${track.title}\``);
      break;
  }
}

export function turntable(orcabot, message) {
  // console.log(message);
  let command = message.content.slice(3).trim();
  const voiceChannel = message.author.voiceChannel;

  // check if user is in a voice channel
  if (voiceChannel === null) {
    orcabot.reply(message, 'You must be in a voice channel to use DJ commands!');
    return;
  }

  // enter voice channel of the user that calls the join command
  if (command === 'join') {
    orcabot.joinVoiceChannel(voiceChannel, (error, connection) => {
      if (error) {
        orcabot.reply(message, 'Error joining voice channel!');
        console.warn('TURNTABLE joinVoiceChannel -- ERROR');
        console.warn(error);
      }
    });
  }

  // print queue
  if (command === 'list') {
    printQueue(orcabot, message);
  }

  // clear queue
  if (command === 'clear') {
    queue = [];
    orcabot.reply(message, 'Current queue cleared!');
  }

  // check if client.voiceConnection property exists and if user is in voice channel with bot
  if (orcabot.voiceConnection !== undefined && orcabot.voiceConnection.id === message.author.voiceChannel.id) {
    // exit channel
    if (command === 'part') {
      // check if a track is currently playing
      if (!orcabot.voiceConnection.playing) {
        orcabot.leaveVoiceChannel(voiceChannel, (error) => {
          if (error) {
            orcabot.reply(message, 'Error leaving voice channel!');
            console.warn('TURNTABLE leaveVoiceChannel -- ERROR');
            console.warn(error);
          }
        });
      } else {
        orcabot.reply(message, `Clear the queue before calling the \`part\` command!`);
      }
    }

    // call relevant loader or search track for playback
    if (command.indexOf('play') === 0) {
      // load and play link
      const songURL = command.slice(4).trim();
      const validURL = urlRegex({
        exact: true
      }).test(songURL);

      // if valid URL, send to appropriate loader
      if (validURL) {
        // loaders
        if (songURL.search(/soundcloud\.com/) !== -1) {
          // SoundCloud
          soundcloud(orcabot, message, songURL, 'link');
        } else if (songURL.search(/youtube\.com/) !== -1) {
          // YouTube
          ytdl(orcabot, message, songURL, 'youtube');
        } else {
          // youtubedl
          ytdl(orcabot, message, songURL);
        }

        // TODO: Spotify
      } else {
        console.log('not a valid URL');

        // play attachment OR first search result
        let searchTerm = songURL;
        if (!searchTerm.length) {
          // play attached file if no search term
          if (message.attachments.length > 0) {
            // check if attachment exists
            for (var i = 0; i < message.attachments.length; i++) {
              var element = message.attachments[i];
              // begin playback from start of queue
              loader(message, element.url, element.filename);
            }

            // play top track from queue to voice channel
            player(orcabot);
          }
        } else {
          // search YouTube (or other site if specified)
          if (!searchTerm.search(/^(sc:)/)) {
            // search SoundCloud
            searchTerm = searchTerm.slice(3);
            soundcloud(orcabot, message, searchTerm, 'search');
          } else {
            // default to YouTube search
            ytImFeelingLucky(orcabot, message, searchTerm).then((searchResult) => {
              ytdl(orcabot, message, searchResult, 'youtube');
            }, (error) => {
              console.log(`YTDL PROMISE -- ${error}`);
              console.log(error);
            });
          }
        }
      }
    }

    // TODO: search function
    if (command.indexOf('search') === 0) {
      const searchTerm = command.slice(6).trim();
      let service = '';
      let query = '';
      if (!searchTerm.search(/(youtube|yt|soundcloud|sc)( )/)) {
        service = searchTerm.split(' ', 1).shift();
        query = searchTerm.slice(service.length).trim();
      } else {
        service = 'youtube';
        query = searchTerm;
      }

      musicSearch(orcabot, message, service, query).then((searchResult) => {
        if (service === 'youtube') {
          ytdl(orcabot, message, searchResult, service);
        } else {
          soundcloud(orcabot, message, searchResult, 'link');
        }
      });
    }

    // check if there is a track playing or paused
    if (orcabot.voiceConnection.playing) {
      // stop playback
      if (command === 'stop') {
        // TODO: implement working stop command
        orcabot.voiceConnection.stopPlaying();
      }

      // pause playback
      if (command === 'pause') {
        orcabot.voiceConnection.pause();
      }

      // return currently playing track
      if (command == 'np') {
        announceNowPlaying(orcabot, message);
      }

      // TODO: skip track (based on majority vote and/or bot handler ID)

      // TODO: shuffle

    } else if (orcabot.voiceConnection.paused) {
      // resume playback from pause
      if (command === 'resume') {
        orcabot.voiceConnection.resume();
      }
    }
  }
}