import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FiStar, FiPlus, FiEdit3, FiArrowLeft, FiHeart, FiTrash2 } from 'react-icons/fi'
import { getAnimeById } from '../services/anilist'
import { useAuth } from '../context/AuthContext'
import { useAnimeList } from '../hooks/useAnimeList'
import RatingModal from '../components/RatingModal'
import AnimeCard from '../components/AnimeCard'

const STATUS_MAP = {
  FINISHED: { label: 'Finished', color: 'text-green-400' },
  RELEASING: { label: 'Airing', color: 'text-blue-400' },
  NOT_YET_RELEASED: { label: 'Not Released', color: 'text-yellow-400' },
}

export default function AnimeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addToList, updateEntry, removeFromList, getEntry, loading: listLoading } = useAnimeList()

  const [anime, setAnime] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userEntry, setUserEntry] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(null)
    getAnimeById(parseInt(id))
      .then(data => setAnime(data?.data?.Media))
      .catch(() => setError('Failed to load anime'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (user && id) {
      getEntry(parseInt(id)).then(setUserEntry)
    }
  }, [user, id])

  const handleSave = async ({ status, rating, review, favorite }) => {
    try {
      if (userEntry) {
        const updated = await updateEntry(parseInt(id), { status, rating, review, favorite })
        setUserEntry(updated)
      } else {
        const created = await addToList(parseInt(id), status, rating, review, favorite)
        setUserEntry(created)
      }
      setShowModal(false)
    } catch {}
  }

  const handleDelete = async () => {
    if (!window.confirm('Remove from list?')) return
    await removeFromList(parseInt(id))
    setUserEntry(null)
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-12 h-12 border-4 border-neko-accent border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (error || !anime) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <p className="text-red-400">{error || 'Anime not found'}</p>
      <button onClick={() => navigate(-1)} className="text-neko-accent underline">Go back</button>
    </div>
  )

  const title = anime.title?.english || anime.title?.romaji
  const status = STATUS_MAP[anime.status] || { label: anime.status, color: 'text-gray-400' }
  const studio = anime.studios?.nodes?.find(s => s.isAnimationStudio)?.name

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-neko-muted hover:text-white transition-colors mb-6">
        <FiArrowLeft size={18} /> Back
      </button>

      {/* Banner */}
      {anime.bannerImage && (
        <div className="relative h-48 md:h-64 rounded-2xl overflow-hidden mb-8">
          <img src={anime.bannerImage} alt={title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-neko-bg via-neko-bg/40 to-transparent" />
        </div>
      )}

      {/* Main Info */}
      <div className="flex gap-6 md:gap-8 mb-8">
        <div className="flex-shrink-0">
          <img
            src={anime.coverImage?.extraLarge || anime.coverImage?.large}
            alt={title}
            className="w-36 md:w-48 rounded-xl shadow-2xl"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold text-neko-text mb-1">{title}</h1>
          {anime.title?.romaji !== title && (
            <p className="text-neko-muted text-sm mb-3">{anime.title?.romaji}</p>
          )}
          <div className="flex flex-wrap gap-3 mb-4">
            {anime.averageScore && (
              <span className="flex items-center gap-1 text-yellow-400 font-bold">
                <FiStar size={16} fill="currentColor" /> {(anime.averageScore / 10).toFixed(1)}/10
              </span>
            )}
            <span className={`font-medium ${status.color}`}>{status.label}</span>
            {anime.episodes && <span className="text-neko-muted">{anime.episodes} eps</span>}
            {anime.format && <span className="text-neko-muted">{anime.format}</span>}
            {anime.seasonYear && <span className="text-neko-muted">{anime.seasonYear}</span>}
            {studio && <span className="text-neko-muted">{studio}</span>}
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {anime.genres?.map(g => (
              <span key={g} className="px-3 py-1 bg-neko-surface rounded-full text-sm text-neko-muted">{g}</span>
            ))}
          </div>

          {/* List Actions */}
          <div className="flex gap-3 flex-wrap">
            {user ? (
              <>
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-neko-accent hover:bg-red-600 text-white rounded-xl font-medium transition-colors"
                >
                  {userEntry ? <><FiEdit3 size={16} /> Edit Entry</> : <><FiPlus size={16} /> Add to List</>}
                </button>
                {userEntry && (
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl font-medium transition-colors"
                  >
                    <FiTrash2 size={16} /> Remove
                  </button>
                )}
                {userEntry && (
                  <div className="flex items-center gap-3 text-sm text-neko-muted ml-1">
                    <span className={`px-2 py-1 rounded-lg text-xs ${
                      userEntry.status === 'visto' ? 'bg-green-500/20 text-green-400' :
                      userEntry.status === 'viendo' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {userEntry.status === 'visto' ? 'Watched' : userEntry.status === 'viendo' ? 'Watching' : 'Plan to Watch'}
                    </span>
                    {userEntry.rating && (
                      <span className="flex items-center gap-1 text-yellow-400">
                        <FiStar size={12} fill="currentColor" /> {userEntry.rating}/10
                      </span>
                    )}
                    {userEntry.favorite && <FiHeart size={14} className="text-neko-accent" fill="currentColor" />}
                  </div>
                )}
              </>
            ) : (
              <p className="text-neko-muted text-sm">Sign in to add to your list</p>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {anime.description && (
        <div className="mb-8 p-6 bg-neko-card rounded-xl">
          <h2 className="text-lg font-semibold mb-3">Synopsis</h2>
          <p className="text-neko-muted leading-relaxed text-sm">{anime.description.replace(/<[^>]*>/g, '')}</p>
        </div>
      )}

      {/* Characters */}
      {anime.characters?.nodes?.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Characters</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {anime.characters.nodes.map(char => (
              <div key={char.id} className="text-center">
                <img
                  src={char.image?.medium}
                  alt={char.name?.full}
                  className="w-16 h-16 rounded-full object-cover mx-auto mb-2 border-2 border-neko-surface"
                />
                <p className="text-xs text-neko-muted">{char.name?.full}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {anime.recommendations?.nodes?.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">You Might Also Like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {anime.recommendations.nodes
              .filter(n => n.mediaRecommendation)
              .map(n => (
                <AnimeCard key={n.mediaRecommendation.id} anime={n.mediaRecommendation} />
              ))}
          </div>
        </div>
      )}

      {showModal && (
        <RatingModal
          anime={anime}
          existingEntry={userEntry}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
          loading={listLoading}
        />
      )}
    </div>
  )
}
