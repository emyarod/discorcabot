// import bot config
import {
  orcabot,
} from './cfg/config.js';

// import modules
import {
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
  turntable,
} from './modules/_moduleloader.js';

orcabot.on('message', (message) => {
  if (message.content === 'ping') {
    orcabot.reply(message, 'pong');
  }

  // console.log(message);

  // nfz
  flex(orcabot, message);

  switch (true) {
    case !message.content.search(/^(\.tw )/gi):
      // Twitter
      twitter(message).then((response) => {
        orcabot.reply(message, response);
      }, (error) => {
        orcabot.reply(message, error);
      });
      break;

    case !message.content.search(/^(\.ig )/gi):
      // Instagram
      instagram(message).then((response) => {
        const [responseType, mediaURL, content] = response;
        if (responseType === 'video') {
          // link video in chat
          orcabot.sendMessage(message, content, (error) => {
            if (error) {
              console.warn(`INSTAGRAM sendMessage (video) -- ${error}`);
            }
          });
        } else {
          // attach image to reply
          orcabot.sendFile(message, mediaURL, null, content, (error) => {
            if (error) {
              console.warn(`INSTAGRAM sendFile (photo) -- ${error}`);
            }
          });
        }
      }, (error) => {
        orcabot.reply(message, error);
      });
      break;

    case !message.content.search(/^(\.similar )/gi):
      // Last.fm get similar artists
      getSimilarArtists(message).then((response) => {
        orcabot.reply(message, response);
      }, (error) => {
        orcabot.reply(message, error);
      });
      break;

    case !message.content.search(/^(\.getinfo )/gi):
      // Last.fm get artist info
      getArtistInfo(message).then((response) => {
        const [image, content] = response;
        if (image !== null) {
          // attach image if Last.fm returns an image
          orcabot.sendFile(message, image, null, content, (error) => {
            if (error) {
              console.warn(`INSTAGRAM sendFile (photo) -- ${error}`);
            }
          });
        } else {
          orcabot.reply(message, content);
        }
      }, (error) => {
        orcabot.reply(message, error);
      });
      break;

    case !message.content.search(/^(\.addlfm )/gi):
      // Last.fm add lfm username to db
      addlfm(orcabot, message);
      break;

    case !message.content.search(/^(\.np)/gi):
      // Last.fm now playing .np <self/user/registered handle>
      nowplaying(orcabot, message);
      break;

    case !message.content.search(/^(\.charts)/gi):
      // Last.fm weekly charts .charts <self/user/registered handle>
      getWeeklyCharts(orcabot, message);
      break;

    case !message.content.search(/^(\.yt )/gi) && message.content !== '.yt ':
      // YouTube
      searchYouTube(message).then((response) => {
        orcabot.reply(message, response);
      }, (error) => {
        orcabot.reply(message, error);
      });
      break;

    case !message.content.search(/^(\.tr )/gi):
      // translator
      textTranslate(orcabot, message);
      break;

    case !message.content.search(/^(\.dj )/gi) && message.content !== '.dj ':
      // turntable
      turntable(orcabot, message);
      break;

    default:
      // default
      break;
  }
});
