import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiEye, FiPlay, FiClock, FiHeart, FiStar, FiList } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { useAnimeList } from '../hooks/useAnimeList'
import { getAnimesByIds } from '../services/anilist'
import AnimeCard from '../components/AnimeCard'

export default function Dashboard() {
  const { user } = useAuth()
  const { getStats, getUserList } = useAnimeList()
  const [stats, setStats] = useState(null)
  const [favorites, setFavorites] = useState([])
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [statsData, favEntries, recentEntries] = await Promise.all([
          getStats(),
          getUserList(null, true),
          getUserList(),
        ])
        setStats(statsData)

        // Fetch anime data for favorites
        if (favEntries.length > 0) {
          const ids = favEntries.map(e => e.animeId)
          const animeData = await getAnimesByIds(ids)
          const media = animeData?.data?.Page?.media || []
          setFavorites(media.slice(0, 6))
        }

        // Fetch recent
        if (recentEntries.length > 0) {
          const ids = recentEntries.slice(0, 10).map(e => e.animeId)
          const animeData = await getAnimesByIds(ids)
          setRecent(animeData?.data?.Page?.media || [])
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const statCards = [
    { icon: FiList, label: 'Total', value: stats?.total || 0, color: 'text-neko-accent' },
    { icon: FiEye, label: 'Watched', value: stats?.watched || 0, color: 'text-green-400' },
    { icon: FiPlay, label: 'Watching', value: stats?.watching || 0, color: 'text-blue-400' },
    { icon: FiClock, label: 'Plan to Watch', value: stats?.planToWatch || 0, color: 'text-yellow-400' },
    { icon: FiHeart, label: 'Favorites', value: stats?.favorites || 0, color: 'text-pink-400' },
    { icon: FiStar, label: 'Avg Rating', value: stats?.avgRating || '—', color: 'text-orange-400' },
  ]

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-12 h-12 border-4 border-neko-accent border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Welcome back, <span className="text-neko-accent">{user?.username}</span>!
        </h1>
        <p className="text-neko-muted mt-1">Here's your anime journey overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        {statCards.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-neko-card rounded-xl p-5 text-center">
            <Icon size={24} className={`mx-auto mb-2 ${color}`} />
            <div className="text-2xl font-bold text-neko-text">{value}</div>
            <div className="text-xs text-neko-muted mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Favorites */}
      {favorites.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FiHeart className="text-neko-accent" /> Favorites
            </h2>
            <Link to="/mylist?filter=favorite" className="text-sm text-neko-accent hover:underline">View all</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {favorites.map(anime => <AnimeCard key={anime.id} anime={anime} />)}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {recent.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Activity</h2>
            <Link to="/mylist" className="text-sm text-neko-accent hover:underline">View all</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {recent.map(anime => <AnimeCard key={anime.id} anime={anime} />)}
          </div>
        </div>
      )}

      {stats?.total === 0 && (
        <div className="text-center py-20">
          <p className="text-neko-muted text-lg mb-4">Your list is empty!</p>
          <Link to="/" className="px-6 py-3 bg-neko-accent hover:bg-red-600 text-white rounded-xl font-medium transition-colors">
            Discover Anime
          </Link>
        </div>
      )}
    </div>
  )
}
