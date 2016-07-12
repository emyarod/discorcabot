// import bot config
import {
  orcabot
} from './cfg/config.js';

// import modules
import {
  greeting,
  flex,
  twitter,
  instagram,
  getSimilarArtists,
  getArtistInfo,
  addlfm,
  nowplaying,
  getWeeklyCharts,
  searchYouTube,
  textTranslate,
  turntable
} from './modules/_moduleloader.js';

orcabot.on('message', (message) => {
  if (message.content === 'ping') {
    orcabot.reply(message, 'pong');
  }

  // console.log(message);

  // hi
  greeting(orcabot, message);

  // nfz
  flex(orcabot, message);

  switch (true) {
    case message.content.search(/^(\.tw )/gi) === 0:
      // Twitter
      twitter(orcabot, message);
      break;

    case message.content.search(/^(\.ig )/gi) === 0:
      // Instagram
      instagram(orcabot, message);
      break;

    case message.content.search(/^(\.similar )/gi) === 0:
      // Last.fm get similar artists
      getSimilarArtists(orcabot, message);
      break;

    case message.content.search(/^(\.getinfo )/gi) === 0:
      // Last.fm get artist info
      getArtistInfo(orcabot, message);
      break;

    case message.content.search(/^(\.addlfm )/gi) === 0:
      // Last.fm add lfm username to db
      addlfm(orcabot, message);
      break;

    case message.content.search(/^(\.np)/gi) === 0:
      // Last.fm now playing .np <self/user/registered handle>
      nowplaying(orcabot, message);
      break;

    case message.content.search(/^(\.charts)/gi) === 0:
      // Last.fm weekly charts .charts <self/user/registered handle>
      getWeeklyCharts(orcabot, message);
      break;

    case message.content.search(/^(\.yt )/gi) === 0 && message.content !== '.yt ':
      // YouTube
      searchYouTube(orcabot, message);
      break;

    case message.content.search(/^(\.tr )/gi) === 0:
      // translator
      textTranslate(orcabot, message);
      break;

    case message.content.search(/^(\.dj )/gi) === 0 && message.content !== '.dj ':
      // turntable
      turntable(orcabot, message);
      break;

    default:
      // default
      break;
  }
});