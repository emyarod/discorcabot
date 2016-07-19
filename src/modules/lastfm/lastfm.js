import keys from '../../cfg/opendoors';
import LastfmAPI from 'lastfmapi';
import fs from 'fs';
const Entities = require('html-entities').AllHtmlEntities;

const lfm = new LastfmAPI({
  api_key: keys.lfmApiKey,
  secret: keys.lfmSecret,
});

/**
 * getSimilarArtists() outputs a list of artists similar to a given artist
 * based on Last.fm's similarity spaces
 * @param {Object} message - represents the data of the input message
 * @return {String} list of similar artists
 */
export function getSimilarArtists(message) {
  const artist = message.content.replace('.similar ', '');
  return new Promise((resolve, reject) => {
    // get 5 artists similar to the given artist
    lfm.artist.getSimilar({
      artist,
      autocorrect: 1,
      limit: 5,
    }, (err, similarArtists) => {
      if (err) {
        console.warn(`LAST.FM .similar -- ${err.message}`);
        console.warn(err);
        reject('artist not found!');
      } else {
        let numSimilarArtists = 0;

        // list up to 5 similar artists
        if ((similarArtists.artist).length < 5) {
          numSimilarArtists = (similarArtists.artist).length;
        } else {
          numSimilarArtists = 5;
        }

        const charts = [];
        for (let i = 0; i < numSimilarArtists; i++) {
          const {
            name: name,
            match: match,
          } = similarArtists.artist[i];

          charts.push(`\`${name}\` (${(match * 100).toFixed(2)}% match)`);
        }

        resolve(`artists similar to **${artist}:** ${charts.join(', ')}`);
      }
    });
  });
}

/**
 * getArtistInfo() outputs Last.fm's description of a given artist
 * @param {Object} message - represents the data of the input message
 * @return {Array} array with image (if returned by Last.fm) and response text
 */
export function getArtistInfo(message) {
  const entities = new Entities();
  const artist = message.content.replace('.getinfo ', '');
  return new Promise((resolve, reject) => {
    // get metadata for an artist, including biography truncated at 300 characters
    lfm.artist.getInfo({
      artist,
      autocorrect: 1,
    }, (err, artistInfo) => {
      if (err) {
        reject(`**${artist}** is not a valid artist on Last.fm!`);
        console.warn(`LAST.FM .getinfo -- ${err.message}`);
        console.warn(err);
        return;
      }

      // strip html, strip whitespace, decode entities, trim
      let reply = entities.decode(artistInfo.bio.summary);
      reply = reply.replace(/<(?:.|\n)*?>/gm, '').replace(/\s+/g, ' ').trim();

      // slice largest image from array of returned images
      let {
        image: image,
      } = artistInfo;

      [{
        '#text': image,
      }] = image.slice(-3, -2);

      // attach image if Last.fm returns an image
      if (image !== '') {
        resolve([image, reply]);
      } else {
        resolve([null, reply]);
      }
    });
  });
}

// file path relative to output file
const lfmdbPATH = 'src/cfg/lastfmdb.json';
let lfmdb = {};

// read contents of the bot's Last.fm database
fs.readFile(lfmdbPATH, 'utf8', (err, data) => {
  if (err) throw err;
  lfmdb = JSON.parse(data);
});

/**
 * addlfm() will add a new user to the bot's Last.fm account database
 * depending on whether or not the account exists or has already been added
 * @param {Object} message - represents the data of the input message
 * @return {String} response text
 */
export function addlfm(message) {
  const discordID = message.author.id;
  const discordUsername = message.author.username;
  const lfmUsername = message.content.replace('.addlfm ', '');

  return new Promise((resolve, reject) => {
    // get information about a user profile
    lfm.user.getInfo(lfmUsername, (err) => {
      if (err) {
        reject(`**${lfmUsername}** is not a registered username on Last.fm!`);
        console.warn(`LAST.FM .addlfm -- ${err.message}`);
        return;
      }

      if (lfmdb[discordID] !== undefined && lfmdb[discordID].lfmUsername === lfmUsername) {
        // if discordID - Last.fm username pair exists in db
        resolve(`You are already linked to **${lfmUsername}** on Last.fm!`);
      } else {
        // add discordID - Last.fm username pair to db
        lfmdb[discordID] = {
          discordUsername,
          lfmUsername,
        };

        // write updated data to file
        fs.writeFile(lfmdbPATH, JSON.stringify(lfmdb, null, 4), (error) => {
          if (error) {
            reject('There was an error writing to the Last.fm database!');
            console.warn(`LAST.FM WRITEFILE -- ${error}`);
          } else {
            resolve(`you are now linked to Last.fm user **${lfmUsername}**`);
          }
        });
      }
    });
  });
}

// now playing .np <self/lfm username/linked username>
/**
 * nowplaying() outputs the current or most recently listened track by a given user
 * after checking whether or not the user is contained in the bot's local database
 * @param {Object} message - represents the data of the input message
 * @return {Array} array containing album art (if applicable) and track details
 */
export function nowplaying(message) {
  /**
   * np() retrieves the current or most recently listened track by a given user
   * @param {String} handle - Last.fm handle to look up
   * @return {Array} array containing album art (if applicable) and track details
   */
  function np(handle) {
    return new Promise((resolve, reject) => {
      // get the current or most recently listened track by a given user
      lfm.user.getRecentTracks({
        user: handle,
        limit: 1,
        extended: 1,
      }, (err, recentTracks) => {
        let username = handle;
        if (err) {
          console.warn(`LAST.FM .np -- ${err.message}`);
          reject(`**${username}** is not a registered username on Last.fm!`);
          return;
        }

        // track name
        const {
          track: [{
            name: trackname,
          }],
        } = recentTracks;

        // track image (can be empty string)
        const {
          '#text': image,
        } = recentTracks.track[0].image.pop();

        // track artist
        const {
          track: [{
            artist: {
              name: artist,
            },
          }],
        } = recentTracks;

        // album
        const {
          track: [{
            album: {
              '#text': album,
            },
          }],
        } = recentTracks;

        // currently scrobbling
        const {
          track: [{
            '@attr': nowscrobbling,
          }],
        } = recentTracks;

        // loved track (can be 0 or 1);
        const {
          track: [{
            loved: loved,
          }],
        } = recentTracks;

        const url = `http://www.last.fm/user/${username}`;
        let content;

        // query lfmdb to see if username is in the database
        Object.keys(lfmdb).forEach((key) => {
          const element = lfmdb[key];
          if (element.discordUsername === username) {
            username = `<@${key}>`;
          }
        }, this);

        // if scrobbling, prepend is listening to, else prepend 'last listened to'
        if (nowscrobbling === undefined) {
          content = `**${username}** last listened to`;
        } else {
          content = `**${username}** is listening to`;
        }

        // adjust output text based on album metadata
        if (album !== '') {
          content += ` \`${trackname}\` by \`${artist}\` from _\`${album}\`_ **|** ${url}`;
        } else {
          content += ` \`${trackname}\` by \`${artist}\` **|** ${url}`;
        }

        // check if user loves track
        if (loved === 1) {
          content += ' **|** ❤';
        } else {
          content += ' **|** 💔';
        }

        // attach image if Last.fm returns an image
        if (image !== '') {
          resolve([image, content]);
        } else {
          resolve([content]);
        }
      });
    });
  }

  return new Promise((resolve, reject) => {
    if (!message.content.trim().search('.np ')) {
      // .np [name]
      let lfmUsername = message.content.replace('.np ', '');

      // check if [name] is a mention
      if (lfmUsername.search(/(<[^>]+>)/) === -1) {
        // [name] is not a mention
        np(lfmUsername).then((response) => {
          resolve(response);
        }, (error) => {
          reject(error);
        });
      } else {
        // [name] is a mention, so [name] === <@discordID>
        lfmUsername = lfmUsername.slice(2, -1);

        // check if [name] is in database
        let found = false;
        Object.keys(lfmdb).forEach((key) => {
          const element = lfmdb[key];
          if (key === lfmUsername) {
            lfmUsername = element.lfmUsername;
            found = true;
            np(lfmUsername).then((response) => {
              resolve(response);
            }, (error) => {
              reject(error);
            });
          }
        }, this);

        if (!found) {
          reject(`<@${lfmUsername}> is not in my Last.fm database!`);
        }
      }
    } else if (message.content === '.np') {
      // check if discordID is in database
      let found = false;
      let lfmUsername = message.author.id;
      Object.keys(lfmdb).forEach((key) => {
        const element = lfmdb[key];
        if (key === lfmUsername) {
          lfmUsername = element.lfmUsername;
          found = true;
          np(lfmUsername).then((response) => {
            resolve(response);
          }, (error) => {
            reject(error);
          });
        }
      }, this);

      if (!found) {
        let content = 'You are not in my Last.fm database! ';
        content += 'Use .addlfm <last.fm username> to add yourself to the database';
        reject(content);
      }
    }
  });
}

/**
 * getWeeklyCharts() outputs the most popular artists for a given Last.fm user in the last week
 * @param {Object} message - represents the data of the input message
 * @return {String} user's listening charts for the last week
 */
export function getWeeklyCharts(message) {
  /**
   * getCharts() retrieves a Last.fm user's most popular artists in the last week
   * along with relevant listening statistics
   * @param {String} handle - Last.fm handle to look up
   * @return {String} user's listening charts for the last week
   */
  function getCharts(handle) {
    return new Promise((resolve, reject) => {
      // get the top artists listened to by the given user in the past week
      lfm.user.getTopArtists({
        user: handle,
        period: '7day',
        limit: 5,
      }, (err, topArtists) => {
        if (err) {
          console.warn(`LAST.FM .charts -- ${err.message}`);
          reject(`**${handle}** is not a registered username on Last.fm!`);
          return;
        }

        let mention = handle;

        // query lfmdb to see if handle is in the database
        Object.keys(lfmdb).forEach((key) => {
          const element = lfmdb[key];
          if (element.discordUsername === handle) {
            mention = `<@${key}>`;
          }
        }, this);

        let content = `Weekly Last.fm charts for **${mention} |**`;

        // check if user has scrobbled any songs in the last seven days
        if (!topArtists.artist.length) {
          content = `**${mention}** has not scrobbled any songs in the last seven days!`;
        } else {
          const url = `http://www.last.fm/user/${handle}`;
          const charts = [];

          // push top artists and playcounts to array
          for (let i = 0; i < topArtists.artist.length; i++) {
            charts.push(`\`${topArtists.artist[i].name}\` (${topArtists.artist[i].playcount})`);
          }

          content += ` ${charts.join(', ')} **|** ${url}`;
        }

        resolve(content);
      });
    });
  }

  return new Promise((resolve, reject) => {
    if (!message.content.trim().search('.charts ')) {
      // .charts [name]
      let lfmUsername = message.content.replace('.charts ', '');

      // check if [name] is a mention
      if (lfmUsername.search(/(<[^>]+>)/) === -1) {
        // [name] is not a mention
        getCharts(lfmUsername).then((response) => {
          resolve(response);
        }, (error) => {
          reject(error);
        });
      } else {
        // [name] is a mention, so [name] === <@discordID>
        lfmUsername = lfmUsername.slice(2, -1);

        // check if [name] is in database
        let found = false;
        Object.keys(lfmdb).forEach((key) => {
          const element = lfmdb[key];
          if (key === lfmUsername) {
            lfmUsername = element.lfmUsername;
            found = true;
            getCharts(lfmUsername).then((response) => {
              resolve(response);
            }, (error) => {
              reject(error);
            });
          }
        }, this);

        if (!found) {
          reject(`<@${lfmUsername}> is not in my Last.fm database!`);
        }
      }
    } else if (message.content === '.charts') {
      // check if discordID is in database
      let found = false;
      let lfmUsername = message.author.id;
      Object.keys(lfmdb).forEach((key) => {
        const element = lfmdb[key];
        if (key === lfmUsername) {
          lfmUsername = element.lfmUsername;
          found = true;
          getCharts(lfmUsername).then((response) => {
            resolve(response);
          }, (error) => {
            reject(error);
          });
        }
      }, this);

      if (!found) {
        let content = 'You are not in my Last.fm database! ';
        content += 'Use `.addlfm <last.fm username>` to add yourself to the database';
        reject(content);
      }
    }
  });
}
