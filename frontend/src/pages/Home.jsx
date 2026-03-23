import React, { useState, useEffect, useCallback } from 'react'
import { FiSearch, FiFilter } from 'react-icons/fi'
import AnimeCard from '../components/AnimeCard'
import SkeletonCard from '../components/SkeletonCard'
import { searchAnime, getTrendingAnime, getGenres } from '../services/anilist'

export default function Home() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [pageInfo, setPageInfo] = useState(null)
  const [genres, setGenres] = useState([])
  const [filters, setFilters] = useState({ genre: '', year: '', sort: 'POPULARITY_DESC' })
  const [showFilters, setShowFilters] = useState(false)

  const years = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i)
  const sortOptions = [
    { value: 'POPULARITY_DESC', label: 'Most Popular' },
    { value: 'SCORE_DESC', label: 'Highest Rated' },
    { value: 'TRENDING_DESC', label: 'Trending' },
    { value: 'UPDATED_AT_DESC', label: 'Recently Updated' },
  ]

  useEffect(() => {
    getGenres().then(data => {
      setGenres(data?.data?.GenreCollection || [])
    }).catch(() => {})
  }, [])

  const fetchAnime = useCallback(async (searchQuery, currentPage, currentFilters) => {
    setLoading(true)
    setError(null)
    try {
      let data
      if (searchQuery) {
        data = await searchAnime(
          searchQuery, currentPage, 20,
          currentFilters.genre || null,
          currentFilters.year ? parseInt(currentFilters.year) : null,
          [currentFilters.sort]
        )
      } else {
        data = await getTrendingAnime(currentPage, 20)
      }
      const pageData = data?.data?.Page
      if (currentPage === 1) {
        setResults(pageData?.media || [])
      } else {
        setResults(prev => [...prev, ...(pageData?.media || [])])
      }
      setPageInfo(pageData?.pageInfo)
    } catch (err) {
      setError('Failed to fetch anime. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1)
      fetchAnime(query, 1, filters)
    }, 400)
    return () => clearTimeout(timer)
  }, [query, filters, fetchAnime])

  useEffect(() => {
    if (page > 1) fetchAnime(query, page, filters)
  }, [page, fetchAnime, query, filters])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Search Bar */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Discover <span className="text-neko-accent">Anime</span>
        </h1>
        <div className="flex gap-3 max-w-2xl mx-auto">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-neko-muted" size={18} />
            <input
              type="text"
              value={query}
              onChange={e => { setQuery(e.target.value); setPage(1) }}
              placeholder="Search anime..."
              className="w-full bg-neko-card rounded-xl pl-12 pr-4 py-3 text-neko-text placeholder-neko-muted focus:outline-none focus:ring-2 focus:ring-neko-accent border border-white/10"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-3 rounded-xl border transition-colors ${
              showFilters || filters.genre || filters.year
                ? 'bg-neko-accent border-neko-accent text-white'
                : 'bg-neko-card border-white/10 text-neko-muted hover:text-white'
            }`}
          >
            <FiFilter size={18} />
          </button>
        </div>

        {showFilters && (
          <div className="max-w-2xl mx-auto mt-3 p-4 bg-neko-card rounded-xl border border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select
              value={filters.genre}
              onChange={e => { setFilters(f => ({ ...f, genre: e.target.value })); setPage(1) }}
              className="bg-neko-surface text-neko-text rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-neko-accent"
            >
              <option value="">All Genres</option>
              {genres.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <select
              value={filters.year}
              onChange={e => { setFilters(f => ({ ...f, year: e.target.value })); setPage(1) }}
              className="bg-neko-surface text-neko-text rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-neko-accent"
            >
              <option value="">All Years</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <select
              value={filters.sort}
              onChange={e => { setFilters(f => ({ ...f, sort: e.target.value })); setPage(1) }}
              className="bg-neko-surface text-neko-text rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-neko-accent"
            >
              {sortOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Results */}
      {error && (
        <div className="text-center py-10 text-red-400">
          <p>{error}</p>
          <button onClick={() => fetchAnime(query, 1, filters)} className="mt-3 text-sm underline hover:text-neko-accent">
            Try again
          </button>
        </div>
      )}

      {!loading && !error && results.length === 0 && (
        <div className="text-center py-20 text-neko-muted">
          <p className="text-xl mb-2">No anime found</p>
          <p className="text-sm">Try a different search term or filters</p>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {results.map(anime => <AnimeCard key={anime.id} anime={anime} />)}
        {loading && Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={`sk-${i}`} />)}
      </div>

      {/* Load More */}
      {!loading && pageInfo?.hasNextPage && (
        <div className="text-center mt-8">
          <button
            onClick={() => setPage(p => p + 1)}
            className="px-8 py-3 bg-neko-card hover:bg-neko-surface border border-white/10 rounded-xl text-neko-text font-medium transition-colors"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  )
}
