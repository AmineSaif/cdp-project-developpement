import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../services/api'
import Header from '../components/Header'
import { useProject } from '../context/ProjectContext'
import '../styles/notifications.css'

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const nav = useNavigate()
  const { setProject, setSprint } = useProject()

  useEffect(() => {
    fetchNotifications()
  }, [])

  async function fetchNotifications() {
    setLoading(true)
    try {
      const res = await API.get('/api/notifications?limit=100')
      setNotifications(res.data.notifications || [])
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    } finally {
      setLoading(false)
    }
  }

  async function markAsRead(notificationId) {
    try {
      await API.patch(`/api/notifications/${notificationId}/read`)
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      )
    } catch (err) {
      console.error('Failed to mark as read:', err)
    }
  }

  async function handleNotificationClick(notif) {
    // Marquer comme lue
    if (!notif.isRead) {
      await markAsRead(notif.id)
    }

    // Redirection vers le projet si disponible
    if (notif.relatedProject) {
      setProject(notif.relatedProject)
      setSprint(null)
      nav('/app')
    }
  }

  function getNotificationIcon(type) {
    switch (type) {
      case 'issue_assigned': return '📋'
      case 'issue_status_changed': return '🔄'
      case 'project_member_joined': return '👥'
      case 'issue_created': return '✨'
      case 'sprint_created': return '🏃'
      default: return '🔔'
    }
  }

  function formatTime(dateString) {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'À l\'instant'
    if (diffMins < 60) return `Il y a ${diffMins} min`
    if (diffHours < 24) return `Il y a ${diffHours}h`
    if (diffDays < 7) return `Il y a ${diffDays}j`
    
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'long',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className="page-container">
      <Header />
      
      <div className="notifications-page">
        <div className="notifications-page-header">
          <div>
            <h1>Notifications</h1>
            {unreadCount > 0 && (
              <p className="unread-summary">{unreadCount} notification{unreadCount > 1 ? 's' : ''} non lue{unreadCount > 1 ? 's' : ''}</p>
            )}
          </div>
          
          {notifications.length > 0 && (
            <button className="btn" onClick={async () => {
              await API.patch('/api/notifications/read-all')
              setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
            }}>
              ✓ Marquer toutes comme lues
            </button>
          )}
        </div>

        <div className="notifications-list-page">
          {loading && (
            <div className="notifications-loading">
              <p>Chargement...</p>
            </div>
          )}

          {!loading && notifications.length === 0 && (
            <div className="notifications-empty">
              <p className="empty-icon">🔔</p>
              <h3>Aucune notification</h3>
              <p>Vous n'avez pas encore de notifications</p>
            </div>
          )}

          {!loading && notifications.map(notif => (
            <div 
              key={notif.id} 
              className={`notification-card ${!notif.isRead ? 'unread' : ''}`}
              onClick={() => handleNotificationClick(notif)}
              style={{ cursor: 'pointer' }}
            >
              <div className="notification-card-icon">
                {getNotificationIcon(notif.type)}
              </div>
              
              <div className="notification-card-content">
                <p className="notification-card-message">{notif.message}</p>
                <div className="notification-card-meta">
                  <span className="notification-card-time">{formatTime(notif.createdAt)}</span>
                  {notif.relatedProject && (
                    <span className="notification-card-project">
                      📁 {notif.relatedProject.name}
                    </span>
                  )}
                </div>
              </div>

              {!notif.isRead && <div className="notification-unread-dot"></div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
