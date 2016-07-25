import keys from '../../cfg/opendoors';
import urlRegex from 'url-regex';
import _ from 'lodash';

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

/**
 * printQueue() prints the current queue to the text channel
 * @return {String} current queue
 */
function printQueue() {
  // queue is empty
  if (!queue.length) {
    return 'The queue is currently empty!';
  }

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
  return `Songs currently in the queue:\n${list}`;
}

/**
 * announceNowPlaying() prints the currently playing track to the text channel
 * @return {String} current track details
 */
function announceNowPlaying() {
  const [track] = queue;
  let response;
  switch (track.platform) {
    case 'soundcloud':
      // SoundCloud
      response = `Currently playing: \`${track.title}\` by \`${track.artist}\``;
      break;

    default:
      response = `Currently playing: \`${track.title}\``;
      break;
  }

  return response;
}

/**
 * skipTrack() skips the currently playing track
 * @param {Object} orcabot Discord.Client
 * @param {Object} message represents the data of the input message
 * @return {Undefined}
 */
function skipTrack(orcabot, message, voters) {
  const voter = message.author.id;
  if (voter === keys.botOwnerID) {
    // skip if bot handler votes to skip
    orcabot.sendMessage(message, 'Skipping current track!');
    orcabot.voiceConnection.stopPlaying();
  } else {
    // number of people in the voice channel, excluding the bot itself
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

/**
 * turntable() wrapper for the turntable plugin
 * includes bot join/part, queue manipulation, media handling, and search
 * @param {Object} orcabot Discord.Client
 * @param {Object} message represents the data of the input message
 * @return {Undefined}
 */
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
    orcabot.reply(message, printQueue());
  }

  // clear queue
  if (command === 'clear') {
    queue.length = 0;
    orcabot.reply(message, 'Current queue cleared!');
  }

  // check if client.voiceConnection property exists and if user is in voice channel with bot
  const connectedToVoice = orcabot.voiceConnection;
  let botVoiceChannel;
  if (connectedToVoice !== undefined) {
    botVoiceChannel = orcabot.voiceConnection.id;
  }

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
    if (!command.indexOf('play')) {
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
          soundcloud(orcabot, message, songURL, validURL, queue);
        } else if (songURL.search(/youtube\.com/) !== -1) {
          // YouTube
          ytdl(orcabot, message, songURL, queue, null, 'youtube');
        } else {
          // youtubedl
          ytdl(orcabot, message, songURL, queue);
        }

        // TODO: Spotify
      } else {
        // play attachment OR first search result
        let searchTerm = songURL;
        if (!searchTerm.length) {
          attachmentLoader(orcabot, message, queue);
        } else {
          // search YouTube (or other site if specified)
          if (!searchTerm.search(/^(sc:)/)) {
            // search SoundCloud
            searchTerm = searchTerm.slice(3);
            soundcloud(orcabot, message, searchTerm, validURL, queue);
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
    if (!command.indexOf('search')) {
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
      if (command === 'stop' && message.author.id === keys.botOwnerID) {
        queue.length = 0;
        orcabot.voiceConnection.stopPlaying();
      }

      // pause playback
      if (command === 'pause') {
        orcabot.voiceConnection.pause();
      }

      // return currently playing track
      if (command === 'np') {
        orcabot.reply(message, announceNowPlaying());
      }

      // skip track (based on majority vote and/or bot handler ID)
      if (command === 'skip') {
        skipTrack(orcabot, message, voteSkippers);
      }

      if (!command.indexOf('volume')) {
        const [, volumeLevel] = command.split(' ');

        if (volumeLevel > 0 && volumeLevel <= 100) {
          orcabot.voiceConnection.setVolume(volumeLevel / 100);
          orcabot.reply(message, `Volume set to ${volumeLevel}%`);
        }
      }

      // shuffles the queue
      if (command === 'shuffle') {
        const shuffled = _.shuffle(queue);
        queue.forEach((element, index) => {
          queue[index] = shuffled[index];
        }, this);

        orcabot.reply(message, 'The queue has been shuffled!');
      }
    } else if (orcabot.voiceConnection.paused) {
      // resume playback from pause
      if (command === 'resume') {
        orcabot.voiceConnection.resume();
      }
    }
  }
}
