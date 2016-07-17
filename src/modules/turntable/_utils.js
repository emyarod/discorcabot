/**
 * loader() adds track details to the current music queue
 * @param {Object} queue current playlist of songs
 * @param {Object} message represents the data of the input message
 * @param {String} streamURL URL to media file for playback
 * @param {String} title track title
 * @param {String} title track artist, if applicable
 * @param {String} platform media distribution platform (YouTube, SoundCloud, or other)
 * @return {Primitive} undefined
 */
export function loader(queue, message, streamURL, title, artist = null, platform = null) {
  queue.push({
    artist,
    title,
    streamURL,
    platform,
    message,
  });
}

/**
 * player() plays the top track from the queue to a voice channel
 * @param {Object} orcabot Discord.Client
 * @param {Object} queue current playlist of songs
 * @return {Primitive} undefined
 */
export function player(orcabot, queue) {
  // stop if queue is empty
  if (!queue.length) {
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
        console.error(`MUSIC PLAYER -- ${error}`);
        console.error(error);
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
        queue.shift();

        // recursive call
        player(orcabot, queue);
      });
    });
  }
}
