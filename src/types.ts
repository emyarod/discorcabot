import { Client, Collection, Message } from 'discord.js';

export interface Command {
  name: string;
  description: string;
  args?: boolean;
  usage?: string;
  guildOnly?: boolean;
  cooldown?: number;
  aliases: string[];
  execute: (message: Message, args?: object) => void;
}

export type Orcabot = Client & { commands?: Collection<string, Command> };
