import axios from 'axios'

// Simple in-memory cache
const cache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

const cachedQuery = async (query, variables = {}) => {
  const key = JSON.stringify({ query, variables })
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }
  const response = await axios.post('/api/anilist', { query, variables })
  cache.set(key, { data: response.data, timestamp: Date.now() })
  return response.data
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
