import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FiSearch, FiList, FiUser, FiLogOut, FiGrid } from 'react-icons/fi'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const isActive = (path) => location.pathname === path

  return (
    <nav className="sticky top-0 z-50 bg-neko-card/90 backdrop-blur border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold">
          <span className="text-neko-accent">Neko</span>
          <span className="text-neko-text">List</span>
        </Link>

        <div className="flex items-center gap-1">
          <Link to="/" className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            isActive('/') ? 'bg-neko-accent text-white' : 'text-neko-muted hover:text-white hover:bg-white/10'
          }`}>
            <FiSearch size={16} /> Search
          </Link>

          {user && (
            <>
              <Link to="/dashboard" className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/dashboard') ? 'bg-neko-accent text-white' : 'text-neko-muted hover:text-white hover:bg-white/10'
              }`}>
                <FiGrid size={16} /> Dashboard
              </Link>
              <Link to="/mylist" className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/mylist') ? 'bg-neko-accent text-white' : 'text-neko-muted hover:text-white hover:bg-white/10'
              }`}>
                <FiList size={16} /> My List
              </Link>
            </>
          )}

          {user ? (
            <div className="flex items-center gap-2 ml-2">
              <span className="text-sm text-neko-muted hidden sm:block">{user.username}</span>
              <button
                onClick={logout}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-neko-muted hover:text-neko-accent hover:bg-white/10 transition-colors"
              >
                <FiLogOut size={16} />
              </button>
            </div>
          ) : (
            <Link to="/auth" className="ml-2 flex items-center gap-2 px-4 py-2 bg-neko-accent text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors">
              <FiUser size={16} /> Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
