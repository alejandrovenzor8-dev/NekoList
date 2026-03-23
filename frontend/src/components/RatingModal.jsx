import React, { useState } from 'react'
import { FiX, FiStar, FiHeart } from 'react-icons/fi'

const STATUS_OPTIONS = [
  { value: 'visto', label: '✅ Watched' },
  { value: 'viendo', label: '▶️ Watching' },
  { value: 'por_ver', label: '📌 Plan to Watch' },
]

export default function RatingModal({ anime, existingEntry, onSave, onClose, loading }) {
  const title = anime?.title?.english || anime?.title?.romaji || 'Unknown'
  const [status, setStatus] = useState(existingEntry?.status || 'por_ver')
  const [rating, setRating] = useState(existingEntry?.rating || 0)
  const [review, setReview] = useState(existingEntry?.review || '')
  const [favorite, setFavorite] = useState(existingEntry?.favorite || false)
  const [hover, setHover] = useState(0)

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({ status, rating: rating || null, review, favorite })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-neko-card rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <img src={anime?.coverImage?.large} alt={title} className="w-12 h-16 object-cover rounded-lg" />
            <div>
              <h2 className="font-bold text-neko-text line-clamp-2">{title}</h2>
              <p className="text-sm text-neko-muted">{anime?.seasonYear}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <FiX size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="text-sm font-medium text-neko-muted mb-2 block">Status</label>
            <div className="grid grid-cols-3 gap-2">
              {STATUS_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatus(opt.value)}
                  className={`py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                    status === opt.value
                      ? 'bg-neko-accent text-white'
                      : 'bg-neko-surface text-neko-muted hover:text-white hover:bg-white/10'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-neko-muted mb-2 block">
              Rating {rating > 0 && <span className="text-neko-accent">{rating}/10</span>}
            </label>
            <div className="flex gap-1">
              {[1,2,3,4,5,6,7,8,9,10].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(rating === n ? 0 : n)}
                  onMouseEnter={() => setHover(n)}
                  onMouseLeave={() => setHover(0)}
                  className={`flex-1 p-1 transition-colors ${
                    n <= (hover || rating) ? 'text-yellow-400' : 'text-neko-surface'
                  }`}
                >
                  <FiStar size={16} fill={n <= (hover || rating) ? 'currentColor' : 'none'} strokeWidth={1.5} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-neko-muted mb-2 block">Review (optional)</label>
            <textarea
              value={review}
              onChange={e => setReview(e.target.value)}
              placeholder="Write your thoughts..."
              maxLength={1000}
              rows={3}
              className="w-full bg-neko-surface rounded-lg px-3 py-2 text-sm text-neko-text placeholder-neko-muted resize-none focus:outline-none focus:ring-1 focus:ring-neko-accent"
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setFavorite(!favorite)}
              className={`flex items-center gap-2 text-sm transition-colors ${favorite ? 'text-neko-accent' : 'text-neko-muted hover:text-neko-accent'}`}
            >
              <FiHeart size={16} fill={favorite ? 'currentColor' : 'none'} />
              Add to Favorites
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-neko-accent hover:bg-red-600 disabled:opacity-50 rounded-xl text-white font-semibold transition-colors"
          >
            {loading ? 'Saving...' : existingEntry ? 'Update Entry' : 'Add to List'}
          </button>
        </form>
      </div>
    </div>
  )
}
