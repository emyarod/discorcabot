import keys from '../../cfg/opendoors';
import urlRegex from 'url-regex';

// TODO: implement radio/preset playlists

// store tracks in currently selected (untitled) playlist
const queue = [];
const voteSkippers = [];

import {
  soundcloud,
  ytdl,
  ytImFeelingLucky,
  attachmentLoader,
} from './_loaders.js';

import {
  musicSearch,
} from './_search.js';

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

// skip currently playing track
function skipTrack(orcabot, message, voters) {
  const voter = message.author.id;
  if (voter === keys.botOwnerID) {
    // skip if bot handler votes to skip
    orcabot.sendMessage(message, 'Skipping current track!');
    orcabot.voiceConnection.stopPlaying();
  } else {
    const members = orcabot.internal.user.voiceChannel.members.length - 1;
    const threshold = members / 2;
    if (voters.indexOf(voter) !== -1) {
      // check if voter has already voted
      orcabot.reply(message, 'You have already voted to skip this track!');
    } else {
      // add voter to skip list
      voters.push(voter);
      let voteMessage = `<@${voter}> has voted to skip the current track.`;

      if (voters.length >= threshold) {
        // skip track if threshold is reached
        orcabot.sendMessage(message, 'Skipping current track!');
        orcabot.voiceConnection.stopPlaying();
      } else {
        // announce number of votes needed to skip
        voteMessage += ` ${threshold - voters.length} votes required`;
        orcabot.sendMessage(message, voteMessage);
      }
    }
  }
}

export function turntable(orcabot, message) {
  // console.error(message);
  const command = message.content.slice(3).trim();
  const voiceChannel = message.author.voiceChannel;

  // check if user is in a voice channel
  if (voiceChannel === null) {
    orcabot.reply(message, 'You must be in a voice channel to use DJ commands!');
    return;
  }

  // enter voice channel of the user that calls the join command
  if (command === 'join') {
    orcabot.joinVoiceChannel(voiceChannel, (error) => {
      if (error) {
        orcabot.reply(message, 'Error joining voice channel!');
        console.error('TURNTABLE joinVoiceChannel -- ERROR');
        console.error(error);
      }
    });
  }

  // print queue
  if (command === 'list') {
    printQueue(orcabot, message);
  }

  // clear queue
  if (command === 'clear') {
    queue.length = 0;
    orcabot.reply(message, 'Current queue cleared!');
    console.error(queue);
  }

  // check if client.voiceConnection property exists and if user is in voice channel with bot
  const connectedToVoice = orcabot.voiceConnection;
  const botVoiceChannel = orcabot.voiceConnection.id;
  if (connectedToVoice !== undefined && botVoiceChannel === message.author.voiceChannel.id) {
    // exit channel
    if (command === 'part') {
      // check if a track is currently playing
      if (!orcabot.voiceConnection.playing) {
        orcabot.leaveVoiceChannel(voiceChannel, (error) => {
          if (error) {
            orcabot.reply(message, 'Error leaving voice channel!');
            console.error('TURNTABLE leaveVoiceChannel -- ERROR');
            console.error(error);
          }
        });
      } else {
        orcabot.reply(message, 'Clear the queue before calling the `part` command!');
      }
    }

    // call relevant loader or search track for playback
    if (command.indexOf('play') === 0) {
      // load and play link
      const songURL = command.slice(4).trim();
      const validURL = urlRegex({
        exact: true,
      }).test(songURL);

      // if valid URL, send to appropriate loader
      if (validURL) {
        // loaders
        if (songURL.search(/soundcloud\.com/) !== -1) {
          // SoundCloud
          soundcloud(orcabot, message, songURL, 'link', queue);
        } else if (songURL.search(/youtube\.com/) !== -1) {
          // YouTube
          ytdl(orcabot, message, songURL, queue, null, 'youtube');
        } else {
          // youtubedl
          ytdl(orcabot, message, songURL, queue);
        }

        // TODO: Spotify
      } else {
        console.error('not a valid URL');

        // play attachment OR first search result
        let searchTerm = songURL;
        if (!searchTerm.length) {
          attachmentLoader(orcabot, message, queue);
        } else {
          // search YouTube (or other site if specified)
          if (!searchTerm.search(/^(sc:)/)) {
            // search SoundCloud
            searchTerm = searchTerm.slice(3);
            soundcloud(orcabot, message, searchTerm, 'search', queue);
          } else {
            // default to YouTube search
            ytImFeelingLucky(orcabot, message, searchTerm).then((searchResult) => {
              ytdl(orcabot, message, searchResult, queue, 'youtube');
            }, (error) => {
              console.error(`YTDL PROMISE -- ${error}`);
              console.error(error);
            });
          }
        }
      }
    }

    // search function
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
          ytdl(orcabot, message, searchResult, queue, service);
        } else {
          soundcloud(orcabot, message, searchResult, 'link', queue);
        }
      }, (error) => {
        orcabot.reply(message, error);
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
      if (command === 'np') {
        announceNowPlaying(orcabot, message);
      }

      // skip track (based on majority vote and/or bot handler ID)
      if (command === 'skip') {
        skipTrack(orcabot, message, voteSkippers);
      }

      // TODO: shuffle
    } else if (orcabot.voiceConnection.paused) {
      // resume playback from pause
      if (command === 'resume') {
        orcabot.voiceConnection.resume();
      }
    }
  }
}
