const axios = require('axios');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 300 }); // 5 minute cache
const ANILIST_URL = 'https://graphql.anilist.co';
const ANILIST_TIMEOUT = 10000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const query = async (graphqlQuery, variables = {}) => {
  const cacheKey = JSON.stringify({ graphqlQuery, variables });
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  let lastError;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await axios.post(
        ANILIST_URL,
        { query: graphqlQuery, variables },
        {
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          timeout: ANILIST_TIMEOUT,
        }
      );

      const data = response.data;
      cache.set(cacheKey, data);
      return data;
    } catch (error) {
      lastError = error;
      if (attempt === 0) {
        await sleep(300);
      }
    }
  }

  throw lastError;
};

module.exports = { query, cache };
