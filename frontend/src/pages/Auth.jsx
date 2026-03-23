import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Auth() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        await login(form.email, form.password)
      } else {
        await register(form.username, form.email, form.password)
      }
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-neko-accent">Neko</span>List
          </h1>
          <p className="text-neko-muted">Track your anime journey</p>
        </div>

        <div className="bg-neko-card rounded-2xl p-8 shadow-2xl">
          <div className="flex gap-1 p-1 bg-neko-surface rounded-xl mb-6">
            {['login', 'register'].map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError('') }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                  mode === m ? 'bg-neko-accent text-white' : 'text-neko-muted hover:text-white'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="text-sm font-medium text-neko-muted block mb-1">Username</label>
                <input
                  type="text"
                  value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  required
                  minLength={3}
                  className="w-full bg-neko-surface rounded-lg px-4 py-3 text-neko-text placeholder-neko-muted focus:outline-none focus:ring-1 focus:ring-neko-accent"
                  placeholder="your_username"
                />
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-neko-muted block mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
                className="w-full bg-neko-surface rounded-lg px-4 py-3 text-neko-text placeholder-neko-muted focus:outline-none focus:ring-1 focus:ring-neko-accent"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-neko-muted block mb-1">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
                minLength={6}
                className="w-full bg-neko-surface rounded-lg px-4 py-3 text-neko-text placeholder-neko-muted focus:outline-none focus:ring-1 focus:ring-neko-accent"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-neko-accent hover:bg-red-600 disabled:opacity-50 rounded-xl text-white font-semibold transition-colors mt-2"
            >
              {loading ? 'Loading...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
