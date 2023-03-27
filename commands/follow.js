const { MessageEmbed } = require("discord.js");
const { MessageCollector } = require("discord.js");
const got = require("got");

const followSchema = require("../models/follow-schema");

module.exports = {
  category: "Crypto Price Alerts",
  description: "Timed alerts reminding of selected crypto prices",
  expectedArgs: "<add/remove> <CoinSymbol> <Channel Tag>",
  minArgs: 3,
  maxArgs: 3,

  // testOnly: true,

  init: (client) => {
    const currencyFotmat = new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    });

    let coinSymbol, coinName, coinPrice, coinLogo, symbolCheck;

    const checkForPosts = async () => {
      const results = await followSchema.find();

      for (const post of results) {
        const { guildId, channelId, symbol } = post;

        const guild = await client.guilds.fetch(guildId);
        if (!guild) continue;

        const channel = guild.channels.cache.get(channelId);
        if (!channel) continue;

        await priceAlerts(symbol, channelId);
      }
      setTimeout(checkForPosts, 1000 * 60 * 60 * 4);
    };

    checkForPosts();

    async function priceAlerts(symbol, channelID) {
      coinSymbol = undefined;
      coinSymbol = symbol;
      coinSymbol = coinSymbol.toUpperCase();

      await getPrice(coinSymbol);
      await priceRounding();
      channel = client.channels.cache.get(channelID);

      const embed = new MessageEmbed()
        .setColor("#fd2973")
        .setDescription(
          `The current price of ${coinSymbol} is **${coinPrice}**`
        )
        .setAuthor(`${coinName} Price Update`, coinLogo)
        .setTimestamp()
        .setFooter(
          "Made by Roo#7777",
          "https://i.ibb.co/VDMp2Bx/0e58a19b5a24f0542691313ff5106e40-1.png"
        );

      channel.send({ embeds: [embed] });
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    async function getPrice(coinID) {
      const headers = {
        accept: "application/json",
        "X-CMC_PRO_API_KEY": process.env.CMC_API_KEY,
      };

      let res;

      try {
        res = await got.get(
          `https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?symbol=${coinID}&convert=GBP`,
          {
            headers,
            responseType: "json",
          }
        );
      } catch (e) {
        console.error(e.toString());
      }

      const coinRequested = res.body.data[coinID][0];

      coinName = coinRequested.name;
      coinPrice = coinRequested.quote.GBP.price;
      coinLogo = `https://s2.coinmarketcap.com/static/img/coins/128x128/${coinRequested.id}.png`;
    }

    async function priceRounding() {
      if (coinPrice < 10 && coinPrice > 1) {
        coinPrice = `£${parseFloat(coinPrice.toFixed(3))}`;
      } else if (coinPrice < 1 && coinPrice > 0.1) {
        coinPrice = `£${parseFloat(coinPrice.toFixed(4))}`;
      } else if (coinPrice < 0.1 && coinPrice > 0.001) {
        coinPrice = `£${parseFloat(coinPrice.toFixed(5))}`;
      } else if (coinPrice < 0.001) {
        coinPrice = `£${parseFloat(coinPrice.toFixed(9))}`;
      } else {
        coinPrice = currencyFotmat.format(coinPrice);
      }
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
  },

  callback: async ({ message, args }) => {
    const { mentions, guild, channel } = message;

    const targetChannel = mentions.channels.last();

    if (!targetChannel) {
      message.reply("Please tag a channel to send your reminder to");
      return;
    }

    // removes the channel tag from the args array
    args.pop();

    const [task, coinSymbol] = args;

    if (task === "add") {
      message.reply(
        `Crypto Alert for ${coinSymbol.toUpperCase()} scheduled in ${targetChannel}`
      );

      await new followSchema({
        symbol: coinSymbol,
        guildId: guild.id,
        channelId: targetChannel.id,
      }).save();
    } else if (task === "remove") {
      message.reply(
        `Crypto Alert for ${coinSymbol.toUpperCase()} removed from ${targetChannel}`
      );

      await followSchema.deleteOne({
        symbol: coinSymbol,
        guildId: guild.id,
        channelId: targetChannel.id,
      });
    } else {
      message.reply(
        `Please type either "add" or "remove" after .follow, you typed ${task}`
      );
      return;
    }
  },
};
