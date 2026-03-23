import React, { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FiSearch } from 'react-icons/fi'
import { useAnimeList } from '../hooks/useAnimeList'
import { getAnimesByIds } from '../services/anilist'
import AnimeListItem from '../components/AnimeListItem'
import RatingModal from '../components/RatingModal'

const FILTERS = [
  { value: '', label: 'All' },
  { value: 'visto', label: 'Watched' },
  { value: 'viendo', label: 'Watching' },
  { value: 'por_ver', label: 'Plan to Watch' },
  { value: 'favorite', label: '❤️ Favorites' },
]

export default function MyList() {
  const [searchParams] = useSearchParams()
  const { getUserList, updateEntry, removeFromList, loading: listLoading } = useAnimeList()
  const [entries, setEntries] = useState([])
  const [animeMap, setAnimeMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState(searchParams.get('filter') || '')
  const [search, setSearch] = useState('')
  const [editEntry, setEditEntry] = useState(null)

  const loadList = useCallback(async () => {
    setLoading(true)
    try {
      const isFavorite = filter === 'favorite'
      const statusFilter = isFavorite ? null : filter || null
      const list = await getUserList(statusFilter, isFavorite ? true : null)
      setEntries(list)

      if (list.length > 0) {
        const ids = list.map(e => e.animeId)
        const data = await getAnimesByIds(ids)
        const media = data?.data?.Page?.media || []
        const map = {}
        media.forEach(a => { map[a.id] = a })
        setAnimeMap(map)
      }
    } finally {
      setLoading(false)
    }
  }, [filter, getUserList])

  useEffect(() => { loadList() }, [loadList])

  const handleEdit = (entry) => {
    setEditEntry(entry)
  }

  const handleSave = async ({ status, rating, review, favorite }) => {
    try {
      await updateEntry(editEntry.animeId, { status, rating, review, favorite })
      setEditEntry(null)
      await loadList()
    } catch {}
  }

  const handleDelete = async (animeId) => {
    if (!window.confirm('Remove from list?')) return
    await removeFromList(animeId)
    await loadList()
  }

  const filtered = entries.filter(e => {
    if (!search) return true
    const anime = animeMap[e.animeId]
    const title = anime?.title?.english || anime?.title?.romaji || ''
    return title.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My List</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neko-muted" size={16} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search your list..."
            className="w-full bg-neko-card rounded-xl pl-10 pr-4 py-2.5 text-neko-text placeholder-neko-muted focus:outline-none focus:ring-1 focus:ring-neko-accent border border-white/10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                filter === f.value
                  ? 'bg-neko-accent text-white'
                  : 'bg-neko-card text-neko-muted border border-white/10 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="grid grid-cols-1 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-28 bg-neko-card rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-neko-muted">
          <p className="text-xl mb-2">Nothing here yet</p>
          <p className="text-sm">Add some anime to your list!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(entry => (
            <AnimeListItem
              key={entry._id}
              entry={entry}
              animeData={animeMap[entry.animeId]}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {editEntry && (
        <RatingModal
          anime={animeMap[editEntry.animeId]}
          existingEntry={editEntry}
          onSave={handleSave}
          onClose={() => setEditEntry(null)}
          loading={listLoading}
        />
      )}
    </div>
  )
}
