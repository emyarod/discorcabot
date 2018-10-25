import { Message } from 'discord.js';

export default {
  name: 'args-info',
  description: `Information about the arguments provided.`,
  args: true,
  execute: (message: Message, args: string[]) =>
    message.channel.send(
      args[0] === 'foo'
        ? 'bar'
        : `Arguments: ${args}\nArguments length: ${args.length}`
    ),
};
