import keys from '../cfg/opendoors';
import LastfmAPI from 'lastfmapi';
const Entities = require('html-entities').AllHtmlEntities;
import fs from 'fs';

const lfm = new LastfmAPI({
  'api_key': keys.lfmApiKey,
  'secret': keys.lfmSecret,
});

// .similar
export function getSimilarArtists(orcabot, message) {
  const artist = message.content.replace('.similar ', '');
  lfm.artist.getSimilar({
    artist: artist,
    autocorrect: 1,
    limit: 5,
  }, (err, similarArtists) => {
    if (err) {
      orcabot.reply(message, '**Last.fm |** Artist not found!');
      console.warn(`LAST.FM .similar -- ${err.message}`);
      console.warn(err);
    } else {
      let numSimilarArtists = 0;

      // list up to 5 similar artists
      if ((similarArtists.artist).length < 5) {
        numSimilarArtists = (similarArtists.artist).length;
      } else {
        numSimilarArtists = 5;
      }

      let charts = [];
      for (let i = 0; i < numSimilarArtists; i++) {
        const {
          name: name,
          match: match,
        } = similarArtists.artist[i];

        charts.push(`**${name}** (${(match * 100).toFixed(2)}% match)`);
      }

      orcabot.reply(message, `artists similar to **${artist}:** ${charts.join(', ')}`);
    }
  });
}

// .getinfo
export function getArtistInfo(orcabot, message) {
  const entities = new Entities();
  const artist = message.content.replace('.getinfo ', '');
  lfm.artist.getInfo({
    artist: artist,
    autocorrect: 1,
  }, (err, artist) => {
    if (err) {
      orcabot.reply(message, `**${artist}** is not a valid artist on Last.fm!`);
      console.warn(`LAST.FM .getinfo -- ${err.message}`);
      console.warn(err);
    } else {
      // strip html, strip whitespace, decode entities, trim
      let reply = entities.decode(artist.bio.summary);
      reply = reply.replace(/<(?:.|\n)*?>/gm, '').replace(/\s+/g, ' ').trim();
      orcabot.reply(message, reply);
    }
  });
}

// file path relative to output file
const lfmdbPATH = `src/cfg/lastfmdb.json`;
let lfmdb = {};

fs.readFile(lfmdbPATH, 'utf8', (err, data) => {
  if (err) throw err;
  lfmdb = JSON.parse(data);
});

// add to db
export function addlfm(orcabot, message) {
  const discordID = message.author.id;
  const discordUsername = message.author.username;
  const lfmUsername = message.content.replace('.addlfm ', '');

  lfm.user.getInfo(lfmUsername, (err, info) => {
    if (err) {
      orcabot.reply(message, `**${lfmUsername}** is not a registered username on Last.fm!`);
      console.warn(`LAST.FM .addlfm -- ${err.message}`);
      return;
    }

    if (lfmdb[discordID] !== undefined && lfmdb[discordID].lfmUsername === lfmUsername) {
      // if discordID - Last.fm username pair exists in db
      orcabot.reply(message, `You are already linked to **${lfmUsername}** on Last.fm!`);
    } else {
      // add discordID - Last.fm username pair to db
      lfmdb[discordID] = {
        'discordUsername': discordUsername,
        'lfmUsername': lfmUsername,
      };

      // write updated data to file
      fs.writeFile(lfmdbPATH, JSON.stringify(lfmdb, null, 4), (err) => {
        if (err) throw err;
        console.log('LAST.FM DATABASE UPDATED');
      });

      orcabot.reply(message, `you are now linked to Last.fm user **${lfmUsername}**`);
    }
  });
}

// now playing .np <self/lfm username/linked username>
export function nowplaying(orcabot, message) {
  function np(handle) {
    lfm.user.getRecentTracks({
      user: handle,
      limit: 1,
      extended: 1,
    }, (err, recentTracks) => {
      if (err) {
        orcabot.reply(message, `**${handle}** is not a registered username on Last.fm!`);
        console.warn(`LAST.FM .np -- ${err.message}`);
        return;
      }

      // track name
      const {
        track: [{
          name: trackname
        }]
      } = recentTracks;

      // track image (can be empty string)
      const {
        '#text': image
      } = recentTracks.track[0].image.pop();

      // track artist
      const {
        track: [{
          artist: {
            name: artist
          }
        }]
      } = recentTracks;

      // album
      const {
        track: [{
          album: {
            '#text': album
          }
        }]
      } = recentTracks;

      // currently scrobbling
      const {
        track: [{
          '@attr': nowscrobbling
        }]
      } = recentTracks;

      // loved track (can be 0 or 1);
      const {
        track: [{
          loved: loved
        }]
      } = recentTracks;

      const url = `http://www.last.fm/user/${handle}`;
      let content;

      // query lfmdb to see if handle is in the database
      for (const key in lfmdb) {
        if (lfmdb.hasOwnProperty(key)) {
          const element = lfmdb[key];
          if (element.discordUsername === handle) {
            handle = `<@${key}>`;
          }
        }
      }

      // if scrobbling, prepend is listening to, else prepend 'last listened to'
      if (nowscrobbling === undefined) {
        content = `**${handle}** last listened to`;
      } else {
        content = `**${handle}** is listening to`;
      }

      // adjust output text based on album metadata
      if (album !== '') {
        content += ` \`${trackname}\` by \`${artist}\` from _\`${album}\`_ **|** ${url}`;
      } else {
        content += ` \`${trackname}\` by \`${artist}\` **|** ${url}`;
      }

      // check if user loves track
      if (loved == 1) {
        content += ' **|** ❤';
      } else {
        content += ' **|** 💔';
      }

      // attach image if Last.fm returns an image
      if (image !== '') {
        orcabot.sendFile(message, image, null, content, (error, message) => {
          if (error) {
            console.warn(`LAST.FM sendFile -- ${error}`);
          }
        });
      } else {
        orcabot.reply(message, content);
      }
    });
  }

  if (message.content.trim().search('.np ') === 0) {
    // .np [name]
    let lfmUsername = message.content.replace('.np ', '');

    // check if [name] is a mention
    if (lfmUsername.search(/(<[^>]+>)/) === -1) {
      // [name] is not a mention
      np(lfmUsername);
    } else {
      // [name] is a mention, so [name] == <@discordID>
      lfmUsername = lfmUsername.slice(2, -1);

      // check if [name] is in database
      let found = false;
      for (var key in lfmdb) {
        if (lfmdb.hasOwnProperty(key)) {
          var element = lfmdb[key];
          if (key == lfmUsername) {
            lfmUsername = element.lfmUsername;
            found = true;
            np(lfmUsername);
          }
        }
      }

      if (!found) {
        orcabot.reply(message, `<@${lfmUsername}> is not in my Last.fm database!`);
      }
    }
  } else if (message.content === '.np') {
    // check if discordID is in database
    let found = false;
    let lfmUsername = message.author.id;
    for (var key in lfmdb) {
      if (lfmdb.hasOwnProperty(key)) {
        var element = lfmdb[key];
        if (key == lfmUsername) {
          lfmUsername = element.lfmUsername;
          found = true;
          np(lfmUsername);
        }
      }
    }

    if (!found) {
      orcabot.reply(message, `You are not in my Last.fm database! Use .addlfm <last.fm username> to add yourself to the database`);
    }
  }
}

// weekly charts .charts <self/user/registered handle>
export function getWeeklyCharts(orcabot, message) {
  function getCharts(handle) {
    lfm.user.getTopArtists({
      user: handle,
      period: '7day',
      limit: 5,
    }, (err, topArtists) => {
      if (err) {
        orcabot.reply(message, `**${handle}** is not a registered username on Last.fm!`);
        console.warn(`LAST.FM .charts -- ${err.message}`);
        return;
      }

      // query lfmdb to see if handle is in the database
      for (const key in lfmdb) {
        if (lfmdb.hasOwnProperty(key)) {
          const element = lfmdb[key];
          if (element.discordUsername === handle) {
            handle = `<@${key}>`;
          }
        }
      }

      let content = `Weekly Last.fm charts for **${handle} |**`;

      // check if user has scrobbled any songs in the last seven days
      if (topArtists.artist.length === 0) {
        content = `**${handle}** has not scrobbled any songs in the last seven days!`
      } else {
        const url = `http://www.last.fm/user/${handle}`;
        let charts = [];

        // push top artists and playcounts to array
        for (let i = 0; i < topArtists.artist.length; i++) {
          charts.push(`\`${topArtists.artist[i].name}\` (${topArtists.artist[i].playcount})`);
        }

        content += ` ${charts.join(', ')} **|** ${url}`;
      }

      orcabot.reply(message, content);
    });
  }

  if (message.content.trim().search('.charts ') === 0) {
    // .charts [name]
    let lfmUsername = message.content.replace('.charts ', '');

    // check if [name] is a mention
    if (lfmUsername.search(/(<[^>]+>)/) === -1) {
      // [name] is not a mention
      getCharts(lfmUsername);
    } else {
      // [name] is a mention, so [name] == <@discordID>
      lfmUsername = lfmUsername.slice(2, -1);

      // check if [name] is in database
      let found = false;
      for (var key in lfmdb) {
        if (lfmdb.hasOwnProperty(key)) {
          var element = lfmdb[key];
          if (key == lfmUsername) {
            lfmUsername = element.lfmUsername;
            found = true;
            getCharts(lfmUsername);
          }
        }
      }

      if (!found) {
        orcabot.reply(message, `<@${lfmUsername}> is not in my Last.fm database!`);
      }
    }
  } else if (message.content === '.charts') {
    // check if discordID is in database
    let found = false;
    let lfmUsername = message.author.id;
    for (var key in lfmdb) {
      if (lfmdb.hasOwnProperty(key)) {
        var element = lfmdb[key];
        if (key == lfmUsername) {
          lfmUsername = element.lfmUsername;
          found = true;
          getCharts(lfmUsername);
        }
      }
    }

    if (!found) {
      orcabot.reply(message, `You are not in my Last.fm database! Use .addlfm <last.fm username> to add yourself to the database`);
    }
  }
}