import keys from '../../cfg/opendoors';
import Twit from 'twit';

const t = new Twit({
  consumer_key: keys.twitterConsumerKey,
  consumer_secret: keys.twitterConsumerSecret,
  access_token: keys.twitterAccessToken,
  access_token_secret: keys.twitterAccessTokenSecret,
});

/**
 * twitter() returns the most recent tweet by a given user
 * @param {Object} message represents the data of the input message
 * @return {String} tweet body and details
 */
export function twitter(message) {
  const user = message.content.replace('.tw ', '');

  return new Promise((resolve, reject) => {
    if (user.length > 0) {
      // Twitter API request
      t.get('statuses/user_timeline', {
        screen_name: user,
        count: 1,
      }, (err, data) => {
        if (err) {
          // error handling
          console.warn(`TWITTER -- ${err}`);
          if (err.statusCode === 401) {
            reject(`**${user}**'s tweets are protected!`);
          } else {
            reject(err.message);
          }
        } else if ([data] === undefined) {
          // empty state
          resolve(`**${user}** hasn't tweeted yet!`);
        } else {
          // username
          const [{
            user: {
              name: username,
            },
          }] = data;

          // screen name
          const [{
            user: {
              screen_name: screenName,
            },
          }] = data;

          // tweet body
          const [{
            text: tweet,
          }] = data;

          // date posted
          const [{
            created_at: date,
          }] = data;

          // output
          let content = 'Most recent tweet by';
          content += `**${username} (@${screenName}) |** ${tweet} **|** ${date}`;
          resolve(content);
        }
      });
    }
  });
}
