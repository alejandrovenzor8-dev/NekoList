export const SEARCH_ANIME = `
  query SearchAnime($search: String!, $page: Int, $perPage: Int, $genre: String) {
    Page(page: $page, perPage: $perPage) {
      media(search: $search, type: ANIME, sort: POPULARITY_DESC, genre: $genre) {
        id
        title {
          romaji
          english
        }
        coverImage {
          large
        }
        genres
        averageScore
        seasonYear
      }
    }
  }
`
