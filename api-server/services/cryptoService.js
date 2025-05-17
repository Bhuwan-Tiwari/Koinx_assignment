const axios = require("axios");
const CryptoData = require("../models/CryptoData");

const COINS = ["bitcoin", "ethereum", "matic-network"];

const fetchCryptoData = async () => {
  try {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/coins/markets`,
      {
        params: {
          vs_currency: "usd",
          ids: COINS.join(","),
          order: "market_cap_desc",
          per_page: 100,
          page: 1,
          sparkline: false,
          price_change_percentage: "24h",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching data from CoinGecko:", error.message);
    throw error;
  }
};

const storeCryptoStats = async () => {
  try {
    const cryptoData = await fetchCryptoData();

    const savedData = [];

    for (const coin of cryptoData) {
      const data = new CryptoData({
        coin: coin.id,
        price: coin.current_price,
        marketCap: coin.market_cap,
        change24h: coin.price_change_percentage_24h,
      });

      await data.save();
      savedData.push(data);
    }

    console.log(`Stored data for ${savedData.length} coins`);
    return savedData;
  } catch (error) {
    console.error("Error storing crypto data:", error.message);
    throw error;
  }
};

const getLatestStats = async (coin) => {
  try {
    const latestData = await CryptoData.findOne({ coin })
      .sort({ timestamp: -1 })
      .exec();

    if (!latestData) {
      throw new Error(`No data found for ${coin}`);
    }

    return {
      price: latestData.price,
      marketCap: latestData.marketCap,
      change24h: latestData.change24h,
    };
  } catch (error) {
    console.error(`Error getting latest stats for ${coin}:`, error.message);
    throw error;
  }
};

const calculateStandardDeviation = async (coin) => {
  try {
    const records = await CryptoData.find({ coin })
      .sort({ timestamp: -1 })
      .limit(100)
      .exec();

    if (records.length === 0) {
      throw new Error(`No data found for ${coin}`);
    }

    const prices = records.map((record) => record.price);

    const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length;

    const squaredDifferencesSum = prices.reduce((sum, price) => {
      const difference = price - mean;
      return sum + difference * difference;
    }, 0);

    const standardDeviation = Math.sqrt(squaredDifferencesSum / prices.length);

    return standardDeviation;
  } catch (error) {
    console.error(
      `Error calculating standard deviation for ${coin}:`,
      error.message
    );
    throw error;
  }
};

module.exports = {
  storeCryptoStats,
  getLatestStats,
  calculateStandardDeviation,
  COINS,
};
