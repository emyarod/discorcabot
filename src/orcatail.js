// import bot config
import {
  orcabot,
} from './cfg/config.js';

// import modules
import * as modules from './modules/_moduleloader.js';

orcabot.on('message', (message) => {
  // disregard bot messages
  if (message.author.bot) {
    return;
  }

  // nfz
  modules.flex(orcabot, message);

  const words = message.content.match(/((?:[a-z][a-z0-9_]*))/gi);
  if (words !== null) {
    const detectEmotes = new Promise((resolve) => {
      modules.matchEmotes(words).then((response) => {
        resolve(response);
      });
    });

    detectEmotes.then((emotes) => {
      emotes.forEach((element) => {
        const [filename] = Object.keys(element);
        const imageURL = element[filename];
        orcabot.sendFile(message, imageURL, `${filename}.png`, null, (error) => {
          if (error) {
            orcabot.reply(message, 'There was an error resolving your request!');
          }
        });
      }, this);
    });
  }

  if (!message.content.search(/^(\.dj )/gi) && message.content !== '.dj ') {
    // turntable
    modules.turntable(orcabot, message);
    return;
  }

  // non-turntable modules
  const moduleSwitch = new Promise((resolve, reject) => {
    switch (true) {
      case message.content === '.help':
        // list commands
        resolve(modules.commandList());
        break;

      case !message.content.search('.help '):
        // command help
        resolve(modules.help(message));
        break;

      case (!message.content.search(/^(\.g )/gi)):
        // google custom search engine (cse)
        resolve(modules.googlesearch(message));
        break;

      case !message.content.search(/^(\.tw )/gi):
        // Twitter
        modules.twitter(message)
          .then((response) => {
            resolve(response);
          }, (error) => {
            reject(error);
          });
        break;

      case !message.content.search(/^(\.ig )/gi):
        // Instagram
        modules.instagram(message)
          .then((response) => {
            resolve(response);
          }, (error) => {
            reject(error);
          });
        break;

      case !message.content.search(/^(\.similar )/gi):
        // Last.fm get similar artists
        modules.getSimilarArtists(message)
          .then((response) => {
            resolve(response);
          }, (error) => {
            reject(error);
          });
        break;

      case !message.content.search(/^(\.getinfo )/gi):
        // Last.fm get artist info
        modules.getArtistInfo(message)
          .then((response) => {
            resolve(response);
          }, (error) => {
            reject(error);
          });
        break;

      case !message.content.search(/^(\.addlfm )/gi):
        // Last.fm add lfm username to db
        modules.addlfm(message)
          .then((response) => {
            resolve(response);
          }, (error) => {
            reject(error);
          });
        break;

      case !message.content.search(/^(\.np)/gi):
        // Last.fm now playing .np <self/user/registered handle>
        modules.nowplaying(message)
          .then((response) => {
            resolve(response);
          }, (error) => {
            reject(error);
          });
        break;

      case !message.content.search(/^(\.charts)/gi):
        // Last.fm weekly charts .charts <self/user/registered handle>
        modules.getWeeklyCharts(message)
          .then((response) => {
            resolve(response);
          }, (error) => {
            reject(error);
          });
        break;

      case !message.content.search(/^(\.yt )/gi) && message.content !== '.yt ':
        // YouTube
        modules.searchYouTube(message)
          .then((response) => {
            resolve(response);
          }, (error) => {
            reject(error);
          });
        break;

      case !message.content.search(/^(\.tr )/gi):
        // translator
        modules.textTranslate(message)
          .then((response) => {
            resolve(response);
          }, (error) => {
            reject(error);
          });
        break;

      default:
        // default
        break;
    }
  });

  moduleSwitch.then((whalesong) => {
    if (whalesong.length === 2) {
      const [image, content] = whalesong;
      orcabot.sendFile(message, image, null, content, (error) => {
        if (error) {
          orcabot.reply(message, 'There was an error resolving your request!');
        }
      });
    } else if (whalesong.length === 1) {
      orcabot.reply(message, [whalesong]);
    } else {
      orcabot.reply(message, whalesong);
    }
  }, (error) => {
    orcabot.reply(message, error);
  });
});
