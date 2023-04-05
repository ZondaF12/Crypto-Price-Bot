const { MessageEmbed } = require("discord.js");
const got = require("got");
const getSymbolFromCurrency = require("currency-symbol-map");

let coinSymbol,
    coinName,
    coinPrice,
    coin24h,
    coin7d,
    coinLogo,
    currencyCode,
    coinSlug;

module.exports = {
    category: "Crypto",
    description: "Checks price of a coin",

    // testOnly: true,

    callback: ({ message }) => {
        priceRequest(message);

        ////////////////////////////////////////////////////////////////////////////////////////////

        async function priceRequest(msg) {
            coinSymbol = msg.content.split(" ")[1];
            coinSymbol = coinSymbol.toUpperCase();
            currencyCode = msg.content.split(" ")[2];

            await getPrice(coinSymbol);
            await priceRounding();

            const embed = new MessageEmbed()
                .setColor("#fd2973")
                .setTitle("Cryptocurrency Price Tracker")
                .setDescription(coinName)
                .setURL(`https://coinmarketcap.com/currencies/${coinSlug}`)
                .setThumbnail(coinLogo)
                .addFields(
                    {
                        name: "**Price (24h)**",
                        value: `${coinPrice} (${
                            Math.round((coin24h + Number.EPSILON) * 100) / 100
                        }%)`,
                    },
                    {
                        name: "**7 Day Percentage Change**",
                        value: `${
                            Math.round((coin7d + Number.EPSILON) * 100) / 100
                        }%`,
                    }
                )
                .setTimestamp()
                .setFooter(
                    "Made by Roo#7777",
                    "https://i.ibb.co/VDMp2Bx/0e58a19b5a24f0542691313ff5106e40-1.png"
                );

            msg.reply({ embeds: [embed] });
        }

        ////////////////////////////////////////////////////////////////////////////////////////////

        async function getPrice(coinID) {
            const headers = {
                accept: "application/json",
                "X-CMC_PRO_API_KEY": process.env.CMC_API_KEY,
            };

            if (getSymbolFromCurrency(currencyCode) === undefined) {
                currencyCode = "GBP";
            } else currencyCode = currencyCode.toUpperCase();

            let res;

            try {
                res = await got.get(
                    `https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?symbol=${coinID}&convert=${currencyCode}`,
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
            coinSlug = coinRequested.slug;
            coinPrice = coinRequested.quote[currencyCode].price;
            coin24h = coinRequested.quote[currencyCode].percent_change_24h;
            coin7d = coinRequested.quote[currencyCode].percent_change_7d;
            coinLogo = `https://s2.coinmarketcap.com/static/img/coins/128x128/${coinRequested.id}.png`;
        }

        ////////////////////////////////////////////////////////////////////////////////////////////
        async function priceRounding() {
            if (coinPrice < 10 && coinPrice > 1) {
                coinPrice = `${getSymbolFromCurrency(currencyCode)}${parseFloat(
                    coinPrice.toFixed(3)
                )}`;
            } else if (coinPrice < 1 && coinPrice > 0.1) {
                coinPrice = `${getSymbolFromCurrency(currencyCode)}${parseFloat(
                    coinPrice.toFixed(4)
                )}`;
            } else if (coinPrice < 0.1 && coinPrice > 0.001) {
                coinPrice = `${getSymbolFromCurrency(currencyCode)}${parseFloat(
                    coinPrice.toFixed(5)
                )}`;
            } else if (coinPrice < 0.001) {
                coinPrice = `${getSymbolFromCurrency(currencyCode)}${parseFloat(
                    coinPrice.toFixed(9)
                )}`;
            } else {
                coinPrice = `${getSymbolFromCurrency(
                    currencyCode
                )}${new Intl.NumberFormat().format(coinPrice)}`;
            }
        }
    },
};
