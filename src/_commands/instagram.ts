import * as cheerio from 'cheerio';
import { Message, RichEmbed } from 'discord.js';
import fetch, { Response } from 'node-fetch';

const fetchProfileData = (username: string) =>
  fetch(`https://www.instagram.com/${username}`)
    .then((response: Response) => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      return response.text();
    })
    .then(html => {
      const $ = cheerio.load(html, {
        lowerCaseTags: true,
        normalizeWhitespace: true,
        xmlMode: true,
      });
      /**
       * find inline script containing username and public account info
       * func(index, element) because Cheerio things
       * https://stackoverflow.com/a/40350534
       */
      const profileData = $('script[type="text/javascript"]')
        .filter(
          (i, e) =>
            $(e).get(0).children[0] &&
            $(e)
              .get(0)
              .children[0].data!.trim()
              .includes(username)
        )
        .get(0)
        .children[0].data!.slice(21, -1);
      return JSON.parse(profileData).entry_data.ProfilePage[0].graphql.user;
    });
const scrapeVideoPage = async (shortcode: string) =>
  fetch(`https://www.instagram.com/p/${shortcode}`)
    .then((response: Response) => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      return response.text();
    })
    .then(html => {
      const $ = cheerio.load(html, {
        lowerCaseTags: true,
        normalizeWhitespace: true,
        xmlMode: true,
      });
      const videoLink = $('meta[property="og:video"]').attr('content');
      return videoLink;
    });

export default {
  name: 'instagram',
  description: `Fetch a user's latest Instagram post`,
  aliases: ['ig', 'insta', 'gram'],
  usage: '<username>',
  cooldown: 3,
  execute: async (message: Message, args: string[]) => {
    const username = args.join(' ');
    try {
      const {
        full_name: fullName,
        is_private: isPrivate,
        profile_pic_url_hd: profilePic,
        edge_owner_to_timeline_media: { count: postCount, edges },
      } = await fetchProfileData(username);
      if (isPrivate) {
        return message.reply(
          `${fullName} (@${username})'s account is private!`
        );
      }
      if (!postCount) {
        return message.reply(
          `${fullName} (@${username}) has no Instagram posts yet!`
        );
      }
      const mostRecentPost = edges[0].node;
      const {
        __typename: postType,
        display_url: imageURL,
        edge_liked_by: { count: likes },
        edge_media_to_caption,
        edge_media_to_comment: { count: comments },
        shortcode,
        taken_at_timestamp: timestamp,
      } = mostRecentPost;
      const caption = edge_media_to_caption.edges[0].node.text || '';
      const content = `Latest Instagram post by **${fullName} (@${username})**`;
      const media =
        postType === 'GraphVideo'
          ? {
              files: [await scrapeVideoPage(shortcode)],
            }
          : new RichEmbed()
              .setColor('#e1306c')
              .setAuthor(
                `${fullName} (@${username})`,
                'https://www.instagram.com/favicon.ico',
                `https://www.instagram.com/${username}`
              )
              .setURL(`https://www.instagram.com/p/${shortcode}`)
              .setTitle(caption)
              .setThumbnail(profilePic)
              .setDescription(postType === 'GraphSidecar' ? 'Album' : '')
              .setImage(imageURL)
              .addField('Likes ♥', likes, true)
              .addField('Comments 💬', comments, true)
              .setFooter(`Posted ${new Date(timestamp * 1000)}`);

      return message.channel.send(content, media);
    } catch (error) {
      console.error(error, `Instagram user **@${username}** not found!`);
      return message.reply(`Instagram user **@${username}** not found!`);
    }
  },
};
