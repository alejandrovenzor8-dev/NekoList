import React from 'react'
import { Link } from 'react-router-dom'
import { FiStar, FiTrash2, FiEdit3, FiHeart } from 'react-icons/fi'

const STATUS_LABELS = {
  visto: { label: 'Watched', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  viendo: { label: 'Watching', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  por_ver: { label: 'Plan to Watch', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
}

export default function AnimeListItem({ entry, animeData, onEdit, onDelete }) {
  const title = animeData?.title?.english || animeData?.title?.romaji || `Anime #${entry.animeId}`
  const { label, color } = STATUS_LABELS[entry.status] || { label: entry.status, color: 'bg-gray-500/20 text-gray-400' }

  return (
    <div className="flex gap-4 p-4 bg-neko-card rounded-xl hover:bg-neko-surface transition-colors">
      <Link to={`/anime/${entry.animeId}`} className="flex-shrink-0">
        <img
          src={animeData?.coverImage?.medium || animeData?.coverImage?.large}
          alt={title}
          className="w-16 h-24 object-cover rounded-lg"
          loading="lazy"
        />
      </Link>
      <div className="flex-1 min-w-0">
        <Link to={`/anime/${entry.animeId}`} className="hover:text-neko-accent transition-colors">
          <h3 className="font-semibold text-neko-text line-clamp-2">{title}</h3>
        </Link>
        <div className="flex flex-wrap items-center gap-2 mt-1">
          <span className={`text-xs px-2 py-0.5 rounded-full border ${color}`}>{label}</span>
          {entry.favorite && (
            <span className="text-xs text-neko-accent flex items-center gap-1">
              <FiHeart size={10} fill="currentColor" /> Fav
            </span>
          )}
          {entry.rating && (
            <span className="text-xs flex items-center gap-1 text-yellow-400">
              <FiStar size={10} fill="currentColor" /> {entry.rating}/10
            </span>
          )}
        </div>
        {entry.review && (
          <p className="text-xs text-neko-muted mt-1 line-clamp-2">{entry.review}</p>
        )}
        <div className="flex items-center gap-2 mt-2">
          {animeData?.genres?.slice(0, 2).map(g => (
            <span key={g} className="text-xs text-neko-muted">{g}</span>
          ))}
        </div>
      </div>
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        <button onClick={() => onEdit(entry)} className="p-2 text-neko-muted hover:text-neko-accent rounded-lg hover:bg-white/10 transition-colors">
          <FiEdit3 size={15} />
        </button>
        <button onClick={() => onDelete(entry.animeId)} className="p-2 text-neko-muted hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors">
          <FiTrash2 size={15} />
        </button>
      </div>
    </div>
  )
}
