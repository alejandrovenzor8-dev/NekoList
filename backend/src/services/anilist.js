const axios = require('axios');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 300 }); // 5 minute cache
const ANILIST_URL = 'https://graphql.anilist.co';

const query = async (graphqlQuery, variables = {}) => {
  const cacheKey = JSON.stringify({ graphqlQuery, variables });
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const response = await axios.post(ANILIST_URL, { query: graphqlQuery, variables }, {
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  });
  const data = response.data;
  cache.set(cacheKey, data);
  return data;
};

module.exports = { query, cache };
