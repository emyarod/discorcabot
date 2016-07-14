import keys from '../../cfg/opendoors';
import Twit from 'twit';

const t = new Twit({
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
      count: 1,
    }, (err, data) => {
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
        orcabot.reply(message, content);
      }
    });
  }
}