import keys from '../cfg/opendoors';
import twit from 'twit';

const t = new twit({
  consumer_key: keys.twitterConsumerKey,
  consumer_secret: keys.twitterConsumerSecret,
  access_token: keys.twitterAccessToken,
  access_token_secret: keys.twitterAccessTokenSecret,
});

export function twitter(orcabot, message) {
  const user = message.content.replace('.tw ', '');

  // Twitter API request
  if (user.length > 0) {
    t.get('statuses/user_timeline', {
      screen_name: user,
      count: 1
    }, (err, data, response) => {
      if (err) {
        // error handling
        console.warn(`TWITTER -- ${err}`);
        orcabot.reply(message, err.message);
      } else if ([data] === undefined) {
        // empty state
        orcabot.reply(message, `**${user}** hasn't tweeted yet!`);
      } else {
        // username
        const [{
          user: {
            name: username
          }
        }] = data;

        // screen name
        const [{
          user: {
            screen_name: screenName
          }
        }] = data;

        // tweet body
        const [{
          text: tweet
        }] = data;

        // date posted
        const [{
          created_at: date
        }] = data;

        // output
        orcabot.reply(message, `Most recent tweet by **${username} (@${screenName}) |** ${tweet} **|** ${date}`);
      }
    });
  }
}