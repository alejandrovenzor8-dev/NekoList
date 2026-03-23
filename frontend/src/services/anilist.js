import axios from 'axios'

const ANILIST_ENDPOINT = 'https://graphql.anilist.co'
const anilistClient = axios.create({
  baseURL: ANILIST_ENDPOINT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 10000,
})

const proxyClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 10000,
})

export const fetchFromAniList = async (query, variables = {}) => {
  const payload = { query, variables }

  try {
    // Prefer backend proxy to avoid browser/CORS network failures.
    const response = await proxyClient.post('/anilist', payload)

    if (response.data?.errors?.length) {
      throw new Error(response.data.errors[0]?.message || 'AniList GraphQL error')
    }

    return response.data
  } catch (proxyError) {
    try {
      // Fallback to direct AniList endpoint when backend is unavailable.
      const directResponse = await anilistClient.post('', payload)

      if (directResponse.data?.errors?.length) {
        throw new Error(directResponse.data.errors[0]?.message || 'AniList GraphQL error')
      }

      return directResponse.data
    } catch (directError) {
      const message = directError.response?.data?.errors?.[0]?.message
        || directError.response?.data?.message
        || proxyError.response?.data?.message
        || directError.message
        || proxyError.message
        || 'No se pudo consultar AniList'

      throw new Error(message)
    }
  }
}

// Simple in-memory cache
const cache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

const cachedQuery = async (query, variables = {}) => {
  const key = JSON.stringify({ query, variables })
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }
  const data = await fetchFromAniList(query, variables)
  cache.set(key, { data, timestamp: Date.now() })
  return data
}

export const searchAnime = (search, page = 1, perPage = 20, genre = null, year = null, sort = ['POPULARITY_DESC']) => {
  const variables = { search, page, perPage, sort }
  if (genre) variables.genre = genre
  if (year) variables.seasonYear = year

  return cachedQuery(
    `query ($search: String, $page: Int, $perPage: Int, $sort: [MediaSort], $genre: String, $seasonYear: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { total currentPage lastPage hasNextPage }
        media(search: $search, type: ANIME, sort: $sort, genre: $genre, seasonYear: $seasonYear) {
          id
          title { romaji english native }
          coverImage { large medium }
          genres
          seasonYear
          popularity
          averageScore
          status
          episodes
          format
          description(asHtml: false)
        }
      }
    }`,
    variables
  )
}

export const getTrendingAnime = (page = 1, perPage = 20) =>
  cachedQuery(
    `query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { total currentPage lastPage hasNextPage }
        media(type: ANIME, sort: TRENDING_DESC) {
          id
          title { romaji english native }
          coverImage { large medium }
          genres
          seasonYear
          popularity
          averageScore
          status
          episodes
          format
          description(asHtml: false)
        }
      }
    }`,
    { page, perPage }
  )

export const getPopularAnime = (page = 1, perPage = 12, genre = null) => {
  const variables = { page, perPage }
  if (genre) variables.genre = genre

  return cachedQuery(
    `query ($page: Int, $perPage: Int, $genre: String) {
      Page(page: $page, perPage: $perPage) {
        media(type: ANIME, sort: POPULARITY_DESC, genre: $genre) {
          id
          title { romaji english native }
          coverImage { large medium }
          genres
          seasonYear
          popularity
          averageScore
          status
          episodes
          format
        }
      }
    }`,
    variables
  )
}

export const getNewestAnime = (page = 1, perPage = 12, genre = null) => {
  const variables = { page, perPage }
  if (genre) variables.genre = genre

  return cachedQuery(
    `query ($page: Int, $perPage: Int, $genre: String) {
      Page(page: $page, perPage: $perPage) {
        media(type: ANIME, sort: START_DATE_DESC, genre: $genre) {
          id
          title { romaji english native }
          coverImage { large medium }
          genres
          seasonYear
          popularity
          averageScore
          status
          episodes
          format
        }
      }
    }`,
    variables
  )
}

export const getAnimeById = (id) =>
  cachedQuery(
    `query ($id: Int) {
      Media(id: $id, type: ANIME) {
        id
        title { romaji english native }
        coverImage { large extraLarge }
        bannerImage
        genres
        seasonYear
        season
        popularity
        averageScore
        meanScore
        status
        episodes
        duration
        format
        source
        studios { nodes { name isAnimationStudio } }
        description(asHtml: false)
        characters(sort: ROLE, perPage: 6) {
          nodes {
            id
            name { full }
            image { medium }
            gender
          }
        }
        recommendations(perPage: 5) {
          nodes {
            mediaRecommendation {
              id
              title { romaji english }
              coverImage { medium }
              averageScore
            }
          }
        }
        trailer { id site }
        siteUrl
        startDate { year month day }
        endDate { year month day }
      }
    }`,
    { id }
  )

export const getAnimesByIds = (ids) =>
  cachedQuery(
    `query ($ids: [Int]) {
      Page(perPage: 50) {
        media(id_in: $ids, type: ANIME) {
          id
          title { romaji english }
          coverImage { large medium }
          genres
          seasonYear
          popularity
          averageScore
          status
          episodes
          format
        }
      }
    }`,
    { ids }
  )

export const getGenres = () =>
  cachedQuery(
    `query {
      GenreCollection
    }`
  )
