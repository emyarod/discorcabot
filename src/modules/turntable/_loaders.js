import keys from '../../cfg/opendoors';
import request from 'request';
import youtubedl from 'youtube-dl';
import google from 'googleapis';
import {
  loader,
  player,
} from './_utils.js';

/**
 * soundcloud() requests and loads SoundCloud tracks or playlists
 * and then passes the audio file to the media player
 * @param {Object} orcabot Discord.Client
 * @param {Object} message represents the data of the input message
 * @param {String} songURL either be a SoundCloud permalink or a search query
 * @param {Boolean} validURL denotes whether the input is a link or a search term
 * @param {Object} queue current playlist of songs
 * @return {Primitive} undefined
 */
export function soundcloud(orcabot, message, songURL, validURL, queue) {
  /**
   * scLoader() passes track metadata gathered from SoundCloud
   * into the loader() function
   * @param {Object} track SoundCloud track object
   * @return {Primitive} undefined
   */
  function scLoader(track) {
    const artist = track.user.username;
    const title = track.title;
    const streamURL = `${track.stream_url}?client_id=${keys.scClientID}`;

    // add track details to current queue
    loader(queue, message, streamURL, title, artist, 'soundcloud');
  }

  if (validURL) {
    const requestURL = `http://api.soundcloud.com/resolve.json?url=${songURL}&client_id=${keys.scClientID}`;

    // make call to SoundCloud API
    request(requestURL, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const track = JSON.parse(body);
        const kind = track.kind;

        // SoundCloud playlist/track handling
        if (kind === 'track') {
          // load track into queue
          scLoader(track);

          // announce queue additions
          const artist = track.user.username;
          const title = track.title;
          orcabot.reply(message, `Added \`${title}\` by \`${artist}\` to the queue!`);
        } else if (kind === 'playlist') {
          // load each track from playlist into queue
          for (let i = 0; i < track.tracks.length; i++) {
            const playlistTrack = track.tracks[i];
            scLoader(playlistTrack);
          }

          // announce queue additions
          const playlistTitle = track.title;
          orcabot.reply(message, `Added playlist \`${playlistTitle}\` to the queue!`);
        }

        // play top track from queue to voice channel
        player(orcabot, queue);
      } else {
        orcabot.reply(message, 'There was an error with your request!');
        console.error(`SOUNDCLOUD LOADER -- ${error}`);
        console.error(error);
      }
    });
  } else {
    // fetch top SoundCloud search result
    const searchTerm = songURL;
    const requestURL = `http://api.soundcloud.com/tracks.json?q=${searchTerm}&client_id=${keys.scClientID}`;

    // make call to SoundCloud API
    request(requestURL, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const [track] = JSON.parse(body);
        // load track into queue
        scLoader(track);

        // announce queue additions
        const artist = track.user.username;
        const title = track.title;
        orcabot.reply(message, `Added \`${title}\` by \`${artist}\` to the queue!`);

        // play top track from queue to voice channel
        player(orcabot, queue);
      } else {
        orcabot.reply(message, 'There was an error with your request!');
        console.error(`SOUNDCLOUD SEARCH LOADER -- ${error}`);
        console.error(error);
      }
    });
  }
}

/**
 * ytdl() requests and loads YouTube tracks or playlists
 * @param {Object} orcabot Discord.Client
 * @param {Object} message represents the data of the input message
 * @param {String} songURL either be a SoundCloud permalink or a search query
 * @param {Object} queue current playlist of songs
 * @param {String} platform marks whether or not extra flags will be passed into ytdl
 * @return {Primitive} undefined
 */
export function ytdl(orcabot, message, songURL, queue, platform = null) {
  /**
   * ytdlLoader() passes video information from youtube-dl.js into loader()
   * @param {Object} track video information from youtube-dl.js
   * @return {Primitive} undefined
   */
  function ytdlLoader(track) {
    const title = track.title;
    const streamURL = track.url;

    // add track details to current queue
    loader(queue, message, streamURL, title, null, 'ytdl');
  }

  // set options based on service platform
  let options = null;
  if (platform === 'youtube') {
    options = ['-f bestaudio'];
  }

  youtubedl.getInfo(songURL, options, (error, info) => {
    if (error) {
      orcabot.reply(message, 'There was an error with your request!');
      console.error(`YOUTUBE LOADER -- ${error}`);
      console.error(error);
    }

    // handler for individual tracks vs playlists
    const kind = info.playlist;
    if (kind === null) {
      // load track into queue
      ytdlLoader(info);

      // announce queue additions
      const title = info.title;
      orcabot.reply(message, `Added \`${title}\` to the queue!`);
    } else if (kind === undefined) {
      // load each track from playlist into queue
      for (let i = 0; i < info.length; i++) {
        const playlistTrack = info[i];
        ytdlLoader(playlistTrack);
      }

      // announce queue additions
      const [{
        playlist_title: playlistTitle,
      }] = info;
      orcabot.reply(message, `Added playlist \`${playlistTitle}\` to the queue!`);
    }

    // play top track from queue to voice channel
    player(orcabot, queue);
  });
}

/**
 * ytImFeelingLucky() fetches top YouTube search result and passes it into the music player
 * @param {Object} orcabot Discord.Client
 * @param {Object} message represents the data of the input message
 * @param {String} searchTerm search term to pass to YouTube API
 * @return {Primitive} undefined
 */
export function ytImFeelingLucky(orcabot, message, searchTerm) {
  const googleAPIKey = keys.googleAPIKey;
  const youtube = google.youtube('v3');

  return new Promise((resolve, reject) => {
    // YouTube API search request
    youtube.search.list({
      auth: googleAPIKey,
      part: 'snippet',
      q: searchTerm,
    }, (error, searchList) => {
      if (!error) {
        if (!searchList.pageInfo.totalResults) {
          // no results from query
          orcabot.reply(message, 'No results found!');
        } else {
          // top search result = searchList.items[0]
          const {
            items: [{
              id: {
                videoId: videoID,
              },
            }],
          } = searchList;

          // get video info
          youtube.videos.list({
            auth: googleAPIKey,
            part: 'snippet, contentDetails, status, statistics',
            id: videoID,
          }, (err) => {
            if (!err) {
              const url = `https://youtu.be/${videoID}`;
              resolve(url);
            } else {
              console.error(`TT YOUTUBE GET VIDEO INFO -- ${err}`);
              orcabot.reply(message, err);
              reject(err);
            }
          });
        }
      } else {
        console.error(`TT YOUTUBE SEARCH -- ${error}`);
      }
    });
  });
}

/**
 * attachmentLoader() passes a file attachment into the music player()
 * @param {Object} orcabot Discord.Client
 * @param {Object} message represents the data of the input message
 * @param {Object} queue current playlist of songs
 */
export function attachmentLoader(orcabot, message, queue) {
  // play attached file if no search term
  if (message.attachments.length > 0) {
    // check if attachment exists
    for (let i = 0; i < message.attachments.length; i++) {
      const element = message.attachments[i];
      // begin playback from start of queue
      loader(queue, message, element.url, element.filename);
    }

    // play top track from queue to voice channel
    player(orcabot, queue);
  }
}
