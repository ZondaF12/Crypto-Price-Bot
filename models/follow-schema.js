const mongoose = require("mongoose");

const reqString = {
  type: String,
  required: true,
};

const followSchema = new mongoose.Schema({
  symbol: reqString,
  // delay: reqString,
  guildId: reqString,
  channelId: reqString,
});

const name = "crypto-price-alert";

module.exports = mongoose.model[name] || mongoose.model(name, followSchema);
