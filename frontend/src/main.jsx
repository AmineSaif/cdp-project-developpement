import React from 'react'
import './index.css'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import Landing from './pages/Landing'
import Register from './pages/Register'
import Login from './pages/Login'
import Board from './pages/Board'
import Profile from './pages/Profile'
import IssueDetails from './pages/IssueDetails'
import Notifications from './pages/Notifications'
import ProjectMembers from './pages/ProjectMembers'
import ProjectSettings from './pages/ProjectSettings'
import ProjectStats from './pages/ProjectStats'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { ProjectProvider } from './context/ProjectContext'
import Projects from './pages/Projects'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ProjectProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          
          <Route path="/app" element={<ProtectedRoute><App /></ProtectedRoute>}>
            <Route index element={<Board />} />
            <Route path="members" element={<ProjectMembers />} />
            <Route path="settings" element={<ProjectSettings />} />
            <Route path="stats" element={<ProjectStats />} />
            <Route path="issues/:id" element={<IssueDetails />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
        </ProjectProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
