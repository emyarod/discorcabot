import * as fs from 'fs';
import fetch, { Response } from 'node-fetch';
// import _ from 'lodash';

const EMOTES_DB_PATH = 'cfg/emotes.json';
let cache = {};

/**
 * getEmotes() makes an API request to twitchemotes.com
 * and gets the latest Twitch.tv emote data
 */
function fetchEmotes(): Promise<{}> {
  return fetch('https://twitchemotes.com/api_cache/v3/images.json')
    .then((response: Response) => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      return response.json();
    })
    .then((data: {}) => data);
}

function saveEmotes(emotes: {}): void {
  fs.writeFile(EMOTES_DB_PATH, JSON.stringify(emotes, null, 4), error => {
    if (error) {
      throw error;
    }
    return emotes;
  });
}

function loadEmotes(): Promise<{}> {
  return new Promise((resolve, reject) => {
    // check if db exists
    fs.readFile(EMOTES_DB_PATH, 'utf8', async (error, dbEmotes) => {
      // db does not exist, so fetch
      if (error || !dbEmotes) {
        const fetched = await fetchEmotes();
        saveEmotes(fetched);
        resolve(fetched);
      }
      return resolve(JSON.parse(dbEmotes));
    });
  });
}

// load db into memory
const refreshCache = async (): Promise<void> => {
  cache = await loadEmotes();
};

refreshCache();
setInterval(refreshCache, 1800000);

export function test() {
  if (cache) {
    console.log('test');
  }
}

// /**
//  * queryEmoteList() checks the user's input against the list of emote codes for a match
//  * @param {Object} emoteList - object containing emote metadata
//  * @param {String} emoteCode - the emote code inputted by the user
//  * @return {Number} returns image_id that corresponds to a matching emote code
//  */
// function queryEmoteList(emoteList, emoteCode) {
//   return new Promise((resolve, reject) => {
//     /**
//      * key === image_id && value === emoteCode
//      * finds the key-value pair that matches the emoteCode provided
//      */
//     const emoteDetails = _.findKey(emoteList, o => o.code === emoteCode);

//     if (emoteDetails) {
//       resolve(emoteDetails);
//     } else {
//       reject(emoteDetails);
//     }
//   });
// }

// /**
//  * emoteChecker() queries the cache and the emote list for emote code matches
//  * @param {String} emoteCode - the emote code inputted by the user
//  * @return {Number} returns image_id that corresponds to a matching emote code
//  */
// function emoteChecker(emoteCode) {
//   // query emote list because cache is empty
//   if (_.isEmpty(cache)) return queryEmoteList(emotes, emoteCode);

//   if (!Promise.reject(queryEmoteList(cache, emoteCode))) {
//     // check if cache contains emote already
//     return queryEmoteList(emotes, emoteCode);
//   }

//   // query emote list if emote not already in cache
//   return queryEmoteList(emotes, emoteCode);
// }

// /**
//  * returnImage() returns the image URL for matching emote codes
//  * @param {Number} imageID - image ID of the matching emote
//  * @return {String} URL to the emote image
//  */
// function returnImage(imageID) {
//   return `https://static-cdn.jtvnw.net/emoticons/v1/${imageID}/5.0`;
// }

// /**
//  * matchEmotes() returns matching Twitch emotes
//  * @param {Array} wordList - array of variables taken each chat message
//  * @return {Object} object containing emote metadata and image URLs
//  */
// export function matchEmotes(wordList) {
//   if (!loaded) return false;

//   return new Promise(resolve => {
//     const images = [];

//     wordList.forEach(emoteCode => {
//       emoteChecker(emoteCode)
//         .then(response => {
//           const imageID = response;
//           cache[imageID] = { code: emoteCode };
//           const pair = {};
//           pair[emoteCode] = returnImage(response);
//           images.push(pair);
//         })
//         .then(() => resolve(images));
//     }, this);
//   });
// }
