import keys from './opendoors';
import Discord from 'discord.js';

export const orcabot = new Discord.Client();

// login and authenticate
orcabot.loginWithToken(keys.discordToken);
