import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import AnimeDetail from './pages/AnimeDetail'
import Dashboard from './pages/Dashboard'
import MyList from './pages/MyList'
import Auth from './pages/Auth'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-neko-bg">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/anime/:id" element={<AnimeDetail />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />
            <Route path="/mylist" element={
              <ProtectedRoute><MyList /></ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
