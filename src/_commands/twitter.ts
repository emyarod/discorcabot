import Twitter from 'twitter-lite';
import { Message, MessageEmbed } from 'discord.js';
import {
  twitterConsumerKey as consumer_key,
  twitterConsumerSecret as consumer_secret,
  twitterAccessToken as access_token_key,
  twitterAccessTokenSecret as access_token_secret,
} from '../../cfg/opendoors';

const tw = new Twitter({
  consumer_key,
  consumer_secret,
  access_token_key,
  access_token_secret,
});

export default {
  name: 'twitter',
  description: `Fetch a user's latest tweet`,
  aliases: ['tw', 'tweet'],
  usage: '<username>',
  cooldown: 3,
  execute: async (message: Message, args: string[]) => {
    const [username, ...rest] = args;
    const params = rest.reduce(
      (acc, curr) => {
        let [key, val] = curr.split(':');
        if (!key || !val) {
          [key, val] = curr.split('=');
        }
        if (key && val) {
          if (key === 'replies') {
            key = 'exclude_replies';
            val = `${!!val}`;
          }
          if (key === 'rts') {
            key = 'include_rts';
          }
          acc[key] = val;
        }
        return acc;
      },
      { count: 1, screen_name: username }
    );
    const response = await tw.get('statuses/user_timeline', params);
    for (const tweet of response) {
      const {
        created_at,
        id_str,
        text,
        entities,
        extended_entities,
        user,
        retweet_count,
        favorite_count,
        possibly_sensitive,
      } = tweet;
      const { name, screen_name, profile_image_url_https } = user;
      console.log(
        created_at,
        id_str,
        text,
        entities,
        extended_entities.media,
        retweet_count,
        favorite_count,
        possibly_sensitive,
        name,
        screen_name,
        profile_image_url_https
      );
      const embed = new MessageEmbed()
        .setColor('#e1306c')
        .setAuthor(
          `${name} (@${screen_name})`,
          'https://twitter.com/favicon.ico',
          `https://twitter.com/${screen_name}`
        )
        .setURL(`https://twitter.com/${screen_name}/status/${id_str}`)
        .setTitle(text)
        .setThumbnail(profile_image_url_https)
        // .setDescription(extended_entities.media.type)
        // .setImage(imageURL)
        .addField('Retweets 💬', retweet_count, true)
        .addField('Likes ♥', favorite_count, true)
        .setFooter(created_at, 'https://twitter.com/favicon.ico');
      message.channel.send('', embed);
    }
  },
};
