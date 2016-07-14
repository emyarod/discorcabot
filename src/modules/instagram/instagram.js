import request from 'request';
import cheerio from 'cheerio';

export function instagram(orcabot, message) {
  const username = message.content.replace('.ig ', '');

  // scrape profile page
  request(`https://www.instagram.com/${username}`, (e, res, html) => {
    if (!e && res.statusCode == 200) {
      // validate username
      if (username === '') {
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

      function getMediaURL(isVideo) {
        // use promise for async request in case media node is a video
        return new Promise((resolve, reject) => {
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

      getMediaURL(isVideo).then((mediaURL) => {
        if (isVideo) {
          const content = `Most recent Instagram post by **\`@${username}\`:** \`${caption}\`\n${mediaURL}`;
          orcabot.sendMessage(message, content, (error, message) => {
            if (error) {
              console.warn(`INSTAGRAM sendMessage (video) -- ${error}`);
            }
          });
        } else {
          const content = `Most recent Instagram post by **\`@${username}\`:** \`${caption}\``;
          orcabot.sendFile(message, mediaURL, null, content, (error, message) => {
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
