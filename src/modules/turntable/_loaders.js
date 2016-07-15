import keys from '../../cfg/opendoors';
import request from 'request';
import youtubedl from 'youtube-dl';
import google from 'googleapis';
import {
  loader,
  player,
} from './_utils.js';

/**
 * SOUNDCLOUD LOADER
 */

// request and load SoundCloud tracks or playlists
export function soundcloud(orcabot, message, songURL, arg, queue) {
  // SoundCloud loader
  function scLoader(track) {
    const artist = track.user.username;
    const title = track.title;
    const streamURL = `${track.stream_url}?client_id=${keys.scClientID}`;

    // add track details to current queue
    loader(queue, message, streamURL, title, artist, 'soundcloud');
  }

  // TODO: possible cleanup
  function singleTrackLoader(track) {
    // load track into queue
    scLoader(track);

    // announce queue additions
    const artist = track.user.username;
    const title = track.title;
    orcabot.reply(message, `Added \`${title}\` by \`${artist}\` to the queue!`);
  }

  if (arg === 'link') {
    const requestURL = `http://api.soundcloud.com/resolve.json?url=${songURL}&client_id=${keys.scClientID}`;

    // make call to SoundCloud API
    request(requestURL, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const track = JSON.parse(body);
        const kind = track.kind;

        // SoundCloud playlist/track handling
        if (kind === 'track') {
          singleTrackLoader(track);
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
      if (!error && response.statusCode === 200) {
        const [track] = JSON.parse(body);
        singleTrackLoader(track);

        // play top track from queue to voice channel
        player(orcabot, queue);
      } else {
        orcabot.reply(message, 'There was an error with your request!');
        console.log(`SOUNDCLOUD SEARCH LOADER -- ${error}`);
        console.log(error);
      }
    });
  }
}

/**
 * YOUTUBE & YTDL LOADERS
 */

// request and load YouTube tracks or playlists
export function ytdl(orcabot, message, songURL, queue, platform = null) {
  // YouTube loader
  function ytdlLoader(track) {
    const title = track.title;
    const streamURL = track.url;

    // add track details to current queue
    loader(queue, message, streamURL, title, 'ytdl');
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
    console.log(`kind = ${kind}`);
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

// fetch top YouTube search result
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
              console.warn(`TT YOUTUBE GET VIDEO INFO -- ${err}`);
              orcabot.reply(message, err);
              reject(err);
            }
          });
        }
      } else {
        console.warn(`TT YOUTUBE SEARCH -- ${error}`);
      }
    });
  });
}

/**
 * FILE ATTACHMENT LOADER
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
