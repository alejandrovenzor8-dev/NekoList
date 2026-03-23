import { useState, useCallback } from 'react'
import api from '../services/api'

export function useAnimeList() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const addToList = useCallback(async (animeId, status, rating = null, review = '', favorite = false) => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.post('/list', { animeId, status, rating, review, favorite })
      return res.data
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding to list')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateEntry = useCallback(async (animeId, updates) => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.put(`/list/${animeId}`, updates)
      return res.data
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating entry')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const removeFromList = useCallback(async (animeId) => {
    setLoading(true)
    setError(null)
    try {
      await api.delete(`/list/${animeId}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Error removing from list')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getEntry = useCallback(async (animeId) => {
    try {
      const res = await api.get(`/list/${animeId}`)
      return res.data
    } catch {
      return null
    }
  }, [])

  const getUserList = useCallback(async (status = null, favorite = null) => {
    try {
      const params = {}
      if (status) params.status = status
      if (favorite !== null) params.favorite = favorite
      const res = await api.get('/list', { params })
      return res.data
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching list')
      return []
    }
  }, [])

  const getStats = useCallback(async () => {
    try {
      const res = await api.get('/list/stats')
      return res.data
    } catch {
      return null
    }
  }, [])

  return { loading, error, addToList, updateEntry, removeFromList, getEntry, getUserList, getStats }
}
