import request from 'request';
import _ from 'lodash';

let emotes;
const cache = {};
let loaded = false;

/**
 * getEmotes() makes an API request to twitchemotes.com
 * and gets the latest Twitch.tv emote data
 * @return {Promise} returns emote data as a JSON after the API call
 */
function getEmotes() {
  return new Promise((resolve, reject) => {
    loaded = false;
    request('https://twitchemotes.com/api_cache/v2/images.json', (error, response, body) => {
      if (!error && response.statusCode === 200) {
        emotes = JSON.parse(body).images;
        loaded = true;
        resolve(JSON.parse(body).images);
      }

      reject(error);
    });
  });
}

// update emote list every 30 minutes
getEmotes().then(() => setInterval(() => getEmotes(), 1800000));

/**
 * queryEmoteList() checks the user's input against the list of emote codes for a match
 * @param {Object} emoteList - object containing emote metadata
 * @param {String} emoteCode - the emote code inputted by the user
 * @return {Number} returns image_id that corresponds to a matching emote code
 */
function queryEmoteList(emoteList, emoteCode) {
  return new Promise((resolve, reject) => {
    /**
     * key === image_id && value === emoteCode
     * finds the key-value pair that matches the emoteCode provided
     */
    const emoteDetails = _.findKey(emoteList, o => o.code === emoteCode);

    if (emoteDetails !== undefined) {
      resolve(emoteDetails);
    } else {
      reject(emoteDetails);
    }
  });
}

/**
 * emoteChecker() queries the cache and the emote list for emote code matches
 * @param {String} emoteCode - the emote code inputted by the user
 * @return {Number} returns image_id that corresponds to a matching emote code
 */
function emoteChecker(emoteCode) {
  // query emote list because cache is empty
  if (_.isEmpty(cache)) return queryEmoteList(emotes, emoteCode);

  if (Promise.reject(queryEmoteList(cache, emoteCode)) === undefined) {
    // check if cache contains emote already
    return queryEmoteList(emotes, emoteCode);
  }

  // query emote list if emote not already in cache
  return queryEmoteList(emotes, emoteCode);
}

/**
 * returnImage() returns the image URL for matching emote codes
 * @param {Number} imageID - image ID of the matching emote
 * @return {String} URL to the emote image
 */
function returnImage(imageID) {
  return `https://static-cdn.jtvnw.net/emoticons/v1/${imageID}/1.0`;
}

/**
 * matchEmotes() returns matching Twitch emotes
 * @param {Array} wordList - array of variables taken each chat message
 * @return {Object} object containing emote metadata and image URLs
 */
export function matchEmotes(wordList) {
  if (!loaded) return false;

  return new Promise(resolve => {
    const images = [];

    wordList.forEach(emoteCode => {
      emoteChecker(emoteCode).then(response => {
        const imageID = response;
        cache[imageID] = { code: emoteCode };
        const pair = {};
        pair[emoteCode] = returnImage(response);
        images.push(pair);
      }).then(() => {
        resolve(images);
      });
    }, this);
  });
}
