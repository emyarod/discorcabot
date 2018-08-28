import * as Discord from 'discord.js';
import keys from './opendoors';

const orcabot = new Discord.Client();

// login and authenticate
orcabot.login(keys.discordToken);

export default orcabot;
