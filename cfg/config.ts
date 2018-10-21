import * as Discord from 'discord.js';
import { Orcabot } from '../src/types';
import { discordToken } from './opendoors';

const orcabot: Orcabot = new Discord.Client();

// login and authenticate
orcabot.login(discordToken);

export default orcabot;
