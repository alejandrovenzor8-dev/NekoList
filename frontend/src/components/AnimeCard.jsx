import React from 'react'
import { Link } from 'react-router-dom'
import { FiStar, FiClock } from 'react-icons/fi'

const statusColors = {
  FINISHED: 'bg-green-500/20 text-green-400',
  RELEASING: 'bg-blue-500/20 text-blue-400',
  NOT_YET_RELEASED: 'bg-yellow-500/20 text-yellow-400',
  CANCELLED: 'bg-red-500/20 text-red-400',
}

export default function AnimeCard({ anime }) {
  const title = anime.title?.english || anime.title?.romaji || 'Unknown'
  const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : null

  return (
    <Link to={`/anime/${anime.id}`} className="group block">
      <div className="bg-neko-card rounded-xl overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-neko-accent/20">
        <div className="relative aspect-[2/3] overflow-hidden">
          <img
            src={anime.coverImage?.large || anime.coverImage?.medium}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {score && (
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-bold text-yellow-400">
              <FiStar size={10} fill="currentColor" /> {score}
            </div>
          )}
          {anime.status && (
            <div className={`absolute bottom-2 left-2 text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[anime.status] || 'bg-gray-500/20 text-gray-400'}`}>
              {anime.status === 'RELEASING' ? 'Airing' : anime.status === 'FINISHED' ? 'Finished' : anime.status}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <div className="p-3">
          <h3 className="text-sm font-semibold text-neko-text line-clamp-2 leading-tight mb-2">{title}</h3>
          <div className="flex flex-wrap gap-1">
            {anime.genres?.slice(0, 2).map(g => (
              <span key={g} className="text-xs px-2 py-0.5 bg-neko-surface rounded-full text-neko-muted">{g}</span>
            ))}
          </div>
          {anime.seasonYear && (
            <p className="text-xs text-neko-muted mt-1 flex items-center gap-1">
              <FiClock size={10} /> {anime.seasonYear}
              {anime.episodes && ` · ${anime.episodes} eps`}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
