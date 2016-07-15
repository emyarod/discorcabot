import request from 'request';
import cheerio from 'cheerio';

/**
 * getMediaURL() returns URL of latest Instagram post
 * @param {Boolean} isVideo Whether medium is image or video
 * @param {String} userID Instagram user ID
 * @return {String} mediaURL Direct link to Instagram medium
 */
function getMediaURL(isVideo, userID) {
  // use promise for async request in case media node is a video
  return new Promise((resolve) => {
    // scrape video link if the media node is a video
    if (isVideo) {
      const {
        0: {
          entry_data: {
            ProfilePage: [{
              user: {
                media: {
                  nodes: [{
                    code: mediaCode,
                  }],
                },
              },
            }],
          },
        },
      } = userID;

      // scrape Instagram post page
      request(`https://www.instagram.com/p/${mediaCode}`, (e, res, html) => {
        if (!e && res.statusCode === 200) {
          const $ = cheerio.load(html, {
            lowerCaseTags: true,
            xmlMode: true,
          });

          const {
            0: {
              attribs: {
                content: mediaURL,
              },
            },
          } = $('meta[property="og:video:secure_url"]');

          resolve(mediaURL);
        }
      });
    } else {
      // extract image URL from JSON object into variable
      let {
        0: {
          entry_data: {
            ProfilePage: [{
              user: {
                media: {
                  nodes: [{
                    display_src: mediaURL,
                  }],
                },
              },
            }],
          },
        },
      } = userID;

      /**
       * trim ig cache key from URL
       *   '.*?' matches any character (except newline)
       *   '(?:\/[\w\.\-]+)+)' matches UNIX Path syntax
       */
      [mediaURL] = mediaURL.match(/.*?(?:\/[\w\.\-]+)+/);
      resolve(mediaURL);
    }
  });
}

/**
 * instagram() outputs the latest Instagram post of a given account
 * based on user input
 * @param {Object} orcabot Discord.Client
 * @param {Object} message represents the data of the input message
 * @return {Primitive} undefined
 */
export function instagram(orcabot, message) {
  const user = message.content.replace('.ig ', '');

  // scrape profile page
  request(`https://www.instagram.com/${user}`, (e, res, html) => {
    if (!e && res.statusCode === 200) {
      // validate user
      if (user === '') {
        return;
      }

      // scrape Instagram profile page
      const $ = cheerio.load(html, {
        lowerCaseTags: true,
        xmlMode: true,
      });

      // find <script> tag containing public account info
      const userID = $('script[type="text/javascript"]').map((index, element) => {
        if ($(element).text().indexOf('window._sharedData') > -1) {
          // return value of window._sharedData variable as JSON
          return JSON.parse($(element).text().slice(21, -1));
        }

        return undefined;
      });

      // return if profile is private
      const {
        0: {
          entry_data: {
            ProfilePage: [{
              user: {
                is_private: isPrivate,
              },
            }],
          },
        },
      } = userID;

      if (isPrivate) {
        orcabot.reply(message, 'This Instagram account is private!');
        return;
      }

      // return if user has no posts
      const {
        0: {
          entry_data: {
            ProfilePage: [{
              user: {
                media: {
                  count: count,
                },
              },
            }],
          },
        },
      } = userID;

      if (count === 0) {
        orcabot.reply(message, 'This user has no posts yet!');
        return;
      }

      // extract post details (username, caption, mediaURL)
      const {
        0: {
          entry_data: {
            ProfilePage: [{
              user: {
                username: username,
              },
            }],
          },
        },
      } = userID;

      let {
        0: {
          entry_data: {
            ProfilePage: [{
              user: {
                media: {
                  nodes: [{
                    caption: caption,
                  }],
                },
              },
            }],
          },
        },
      } = userID;

      // replace null caption with empty string
      if (caption == null) {
        caption = '';
      }

      // check if the media node is a video
      const {
        0: {
          entry_data: {
            ProfilePage: [{
              user: {
                media: {
                  nodes: [{
                    is_video: isVideo,
                  }],
                },
              },
            }],
          },
        },
      } = userID;

      // get link to media then reply in chat
      getMediaURL(isVideo, userID).then((mediaURL) => {
        if (isVideo) {
          // link video in chat
          let content = 'Most recent Instagram post by ';
          content += `**\`@${username}\`:** \`${caption}\`\n${mediaURL}`;
          orcabot.sendMessage(message, content, (error) => {
            if (error) {
              console.warn(`INSTAGRAM sendMessage (video) -- ${error}`);
            }
          });
        } else {
          // attach image to reply
          const content = `Most recent Instagram post by **\`@${username}\`:** \`${caption}\``;
          orcabot.sendFile(message, mediaURL, null, content, (error) => {
            if (error) {
              console.warn(`INSTAGRAM sendFile (photo) -- ${error}`);
            }
          });
        }
      });
    } else {
      console.warn(`INSTAGRAM request -- ${e}`);
      orcabot.reply(message, 'This Instagram account cannot be found!');
    }
  });
}
