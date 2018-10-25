import { Message } from 'discord.js';

export default {
  name: 'ping',
  description: 'Ping!',
  cooldown: 5,
  execute: (message: Message) => message.channel.send('Pong.'),
};
