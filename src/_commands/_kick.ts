import { Message } from 'discord.js';

export default {
  name: 'kick',
  description: 'Tag a member and kick them (but not really).',
  guildOnly: true,
  execute(message: Message) {
    if (!message.mentions.users.size) {
      return message.reply('you need to tag a user in order to kick them!');
    }

    const taggedUser = message.mentions.users.first();
    return message.channel.send(`You wanted to kick: ${taggedUser.username}`);
  },
};
