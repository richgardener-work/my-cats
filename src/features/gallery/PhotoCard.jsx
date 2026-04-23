'use client'
import { useState, useRef } from 'react'
import { Play, Trash2 } from 'lucide-react'

export default function PhotoCard({ photo, onClick, onDelete, isAuthorized, index = 0 }) {
  const [showDelete, setShowDelete] = useState(false)
  const longPressTimer = useRef(null)

  const handlePointerDown = () => {
    if (!isAuthorized) return
    longPressTimer.current = setTimeout(() => setShowDelete(true), 600)
  }
  const handlePointerUp = () => clearTimeout(longPressTimer.current)

  return (
    <div
      className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group bg-light-card dark:bg-dark-card"
      style={{
        animationDelay: `${index * 55}ms`,
        animationFillMode: 'both',
      }}
      onClick={() => { if (!showDelete) onClick(photo) }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* outer double-bezel ring */}
      <div className="absolute inset-0 ring-1 ring-black/5 dark:ring-white/5 rounded-2xl z-10 pointer-events-none" />

      <img
        src={photo.imageUrl}
        alt=""
        className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
        loading="lazy"
      />

      {/* hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center justify-center z-[1]">
        <div className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
          <Play size={16} strokeWidth={1.5} className="text-white ml-0.5" />
        </div>
      </div>

      {/* delete button — appears on long-press */}
      {showDelete && isAuthorized && (
        <button
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white shadow-md z-20 animate-[pop-in_0.25s_cubic-bezier(0.16,1,0.3,1)]"
          onClick={(e) => { e.stopPropagation(); onDelete(photo) }}
        >
          <Trash2 size={13} strokeWidth={1.5} />
        </button>
      )}

      {/* dismiss overlay for delete state */}
      {showDelete && (
        <button
          className="absolute inset-0 z-[5]"
          onClick={(e) => { e.stopPropagation(); setShowDelete(false) }}
        />
      )}
    </div>
  )
}
