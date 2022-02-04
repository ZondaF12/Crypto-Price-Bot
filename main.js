const DiscordJS = require("discord.js");
const WOKCommands = require("wokcommands");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();

const { Intents } = DiscordJS;
const client = new DiscordJS.Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

client.on("ready", async () => {
  console.log(`${client.user.tag} is active!`);

  new WOKCommands(client, {
    commandDir: path.join(__dirname, "commands"),
    testServers: [`${process.env.TEST_SERVER}`],

    // Pass in mongo connection URI
    mongoUri: process.env.MONGO_URI,
  }).setDefaultPrefix(".");
});

client.login(process.env.TOKEN);
