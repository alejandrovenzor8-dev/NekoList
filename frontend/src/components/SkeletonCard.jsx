import React from 'react'

export default function SkeletonCard() {
  return (
    <div className="bg-neko-card rounded-xl overflow-hidden animate-pulse">
      <div className="aspect-[2/3] bg-neko-surface" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-neko-surface rounded w-3/4" />
        <div className="h-3 bg-neko-surface rounded w-1/2" />
        <div className="flex gap-1">
          <div className="h-5 bg-neko-surface rounded-full w-16" />
          <div className="h-5 bg-neko-surface rounded-full w-12" />
        </div>
      </div>
    </div>
  )
}
