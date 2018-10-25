import { Message } from 'discord.js';

export default {
  name: 'avatar',
  description: 'Get the avatar URL of the tagged user(s), or your own avatar.',
  aliases: ['icon', 'pfp'],
  execute(message: Message) {
    if (!message.mentions.users.size) {
      return message.channel.send(
        `Your avatar: ${message.author.displayAvatarURL}`
      );
    }

    const avatarList = message.mentions.users.map(
      user => `${user.username}'s avatar: ${user.displayAvatarURL}`
    );
    return message.channel.send(avatarList);
  },
};
