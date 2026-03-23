import React, { useEffect, useMemo, useState } from 'react'
import { FiChevronDown } from 'react-icons/fi'
import { fetchFromAniList, getGenres, getNewestAnime, getPopularAnime } from '../services/anilist'
import { SEARCH_ANIME } from '../queries/anime'
import AnimeCard from './AnimeCard'

const DEBOUNCE_MS = 450

export default function AnimeSearch() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [lastExecutedKey, setLastExecutedKey] = useState('')

  const [popularAnime, setPopularAnime] = useState([])
  const [newAnime, setNewAnime] = useState([])
  const [homeLoading, setHomeLoading] = useState(true)
  const [homeError, setHomeError] = useState('')

  const [genres, setGenres] = useState([])
  const [selectedGenre, setSelectedGenre] = useState('')
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim())
    }, DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [search])

  const canSearch = useMemo(() => debouncedSearch.length > 0, [debouncedSearch])

  useEffect(() => {
    let isMounted = true

    const loadGenres = async () => {
      try {
        const data = await getGenres()
        if (isMounted) {
          setGenres(data?.data?.GenreCollection || [])
        }
      } catch {
        if (isMounted) {
          setGenres([])
        }
      }
    }

    loadGenres()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const loadHomeSections = async () => {
      setHomeLoading(true)
      setHomeError('')

      try {
        const [popularData, newestData] = await Promise.all([
          getPopularAnime(1, 12, selectedGenre || null),
          getNewestAnime(1, 12, selectedGenre || null),
        ])

        if (!isMounted) return

        setPopularAnime(popularData?.data?.Page?.media || [])
        setNewAnime(newestData?.data?.Page?.media || [])
      } catch (err) {
        if (!isMounted) return
        setHomeError(err.message || 'No se pudieron cargar secciones de anime.')
        setPopularAnime([])
        setNewAnime([])
      } finally {
        if (isMounted) setHomeLoading(false)
      }
    }

    loadHomeSections()

    return () => {
      isMounted = false
    }
  }, [selectedGenre])

  const runSearch = async (rawSearch) => {
    const normalizedSearch = rawSearch.trim()
    const searchKey = `${normalizedSearch}::${selectedGenre || 'all'}`

    if (!normalizedSearch) {
      setResults([])
      setError('')
      setLastExecutedKey('')
      return
    }

    if (searchKey === lastExecutedKey) {
      return
    }

    setLoading(true)
    setError('')

    try {
      const data = await fetchFromAniList(SEARCH_ANIME, {
        search: normalizedSearch,
        page: 1,
        perPage: 24,
        genre: selectedGenre || null,
      })

      const media = data?.data?.Page?.media || []
      setResults(media)
      setLastExecutedKey(searchKey)
    } catch (err) {
      setError(err.message || 'Ocurrió un error al buscar en AniList.')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    await runSearch(search)
  }

  useEffect(() => {
    if (canSearch) {
      runSearch(debouncedSearch)
    } else {
      setResults([])
      setError('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canSearch, debouncedSearch, selectedGenre])

  const showSearchResults = search.trim().length > 0

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-6 text-neko-text">Explora Anime</h1>

      <form onSubmit={onSubmit} className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-2 mb-6">
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Escribe un anime..."
          className="flex-1 bg-neko-card border border-white/10 rounded-xl px-4 py-3 text-neko-text placeholder-neko-muted focus:outline-none focus:ring-2 focus:ring-neko-accent"
        />
        <div className="relative sm:w-60">
          <button
            type="button"
            onClick={() => setShowCategoryDropdown((prev) => !prev)}
            className="w-full px-4 py-3 rounded-xl bg-neko-card border border-white/10 text-neko-text flex items-center justify-between"
          >
            <span>{selectedGenre || 'Todas las categorías'}</span>
            <FiChevronDown className={`transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showCategoryDropdown && (
            <div className="absolute z-20 mt-2 w-full bg-neko-card border border-white/10 rounded-xl p-2 shadow-xl">
              <select
                value={selectedGenre}
                onChange={(event) => {
                  setSelectedGenre(event.target.value)
                  setShowCategoryDropdown(false)
                }}
                className="w-full bg-neko-surface rounded-lg px-3 py-2 text-sm text-neko-text focus:outline-none"
              >
                <option value="">Todas las categorías</option>
                {genres.map((genre) => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={loading || !search.trim()}
          className="px-5 py-3 rounded-xl bg-neko-accent text-white font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Buscar
        </button>
      </form>

      {showSearchResults && loading && (
        <div className="text-center py-8 text-neko-muted">Cargando resultados...</div>
      )}

      {showSearchResults && !loading && error && (
        <div className="max-w-2xl mx-auto mb-6 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-300">
          {error}
        </div>
      )}

      {showSearchResults && !loading && !error && results.length === 0 && (
        <div className="text-center py-8 text-neko-muted">No se encontraron animes para esa búsqueda.</div>
      )}

      {showSearchResults && (
        <div>
          <h2 className="text-xl font-semibold text-neko-text mb-4">Resultados de búsqueda</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {results.map((anime) => <AnimeCard key={anime.id} anime={anime} />)}
          </div>
        </div>
      )}

      {!showSearchResults && (
        <div className="space-y-10">
          {homeLoading && (
            <div className="text-center py-8 text-neko-muted">Cargando secciones principales...</div>
          )}

          {!homeLoading && homeError && (
            <div className="max-w-2xl mx-auto rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-300">
              {homeError}
            </div>
          )}

          {!homeLoading && !homeError && (
            <>
              <div>
                <h2 className="text-xl font-semibold text-neko-text mb-4">Populares del momento</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {popularAnime.map((anime) => <AnimeCard key={anime.id} anime={anime} />)}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-neko-text mb-4">Nuevos lanzamientos</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {newAnime.map((anime) => <AnimeCard key={anime.id} anime={anime} />)}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  )
}
