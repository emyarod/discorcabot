// play top track from queue to voice channel
export function player(orcabot, queue) {
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
        player(orcabot, queue);
      });
    });
  }
}