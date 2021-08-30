import { Client, Intents } from "discord.js";
import { discordToken } from "./opendoors";
import { Orcabot } from "../src/types";

const orcabot: Orcabot = new Client({ intents: [Intents.FLAGS.GUILDS] });

// login and authenticate
orcabot.login(discordToken);

export default orcabot;
