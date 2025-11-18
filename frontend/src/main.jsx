import React from 'react'
import './index.css'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import Register from './pages/Register'
import Login from './pages/Login'
import IssuesList from './pages/IssuesList'
import IssueDetails from './pages/IssueDetails'
import CreateIssue from './pages/CreateIssue'
import Board from './pages/Board'
import Landing from './pages/Landing'
import Profile from './pages/Profile'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public landing page */}
          <Route path="/" element={<Landing />} />

          {/* Auth routes */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* Protected application area under /app */}
          <Route path="/app" element={<ProtectedRoute><App /></ProtectedRoute>}>
            <Route index element={<Board />} />
            <Route path="issues/:id" element={<IssueDetails />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
