const { MessageEmbed } = require("discord.js");
const got = require("got");

module.exports = {
  category: "OpenSea",
  description: "Replies with OS Floor information",

  testOnly: true,

  callback: ({ message }) => {
    let collectionName,
      floorPrice,
      uniqueOwners,
      totalSupply,
      dailySales,
      dailySalesChange;

    sendFloorEmbed(message);

    //////////////////////////////////////////////////////////////////////////////

    async function sendFloorEmbed(msg) {
      collectionName = msg.content.split(" ")[1];
      collectionName = collectionName.toLowerCase();

      await getCollectionStats(collectionName);

      const embed = new MessageEmbed()
        .setColor("#fd2973")
        .setTitle(collectionName)
        .setURL(`https://opensea.io/collection/${collectionName}`)
        .addFields(
          {
            name: "**Floor Price**",
            value: `${floorPrice}Ξ`,
          },
          {
            name: "**Unique Owners**",
            value: `${uniqueOwners}`,
          },
          {
            name: "**Total Supply**",
            value: `${totalSupply}`,
          },
          {
            name: "**Daily Sales**",
            value: `${dailySales} (${Math.round(
              ((dailySalesChange + Number.EPSILON) * 100) / 100
            )}%)`,
          }
        )
        .setTimestamp()
        .setFooter(
          "Made by Roo#7777",
          "https://i.ibb.co/VDMp2Bx/0e58a19b5a24f0542691313ff5106e40-1.png"
        );

      msg.reply({ embeds: [embed] });
    }

    //////////////////////////////////////////////////////////////////////////////

    async function getCollectionStats(collection) {
      const headers = {
        Accept: "application/json",
      };

      let res;

      try {
        res = await got.get(
          `https://api.opensea.io/api/v1/collection/${collection}/stats`,
          {
            headers,
            responseType: "json",
          }
        );
      } catch (e) {
        console.error(e.toString());
      }
      floorPrice = res.body.stats.floor_price;
      uniqueOwners = res.body.stats.num_owners;
      totalSupply = res.body.stats.total_supply;
      dailySales = res.body.stats.one_day_sales;
      dailySalesChange = res.body.stats.one_day_change;
    }
  },
};
