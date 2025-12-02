import React, { useState, useEffect, useRef } from 'react'
import { BellIcon } from '@heroicons/react/24/outline'
import { useNavigate } from 'react-router-dom'
import { useProject } from '../context/ProjectContext'
import API from '../services/api'
import '../styles/notifications.css'

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef(null)
  const nav = useNavigate()
  const { setProject, setSprint } = useProject()

  // Charger le nombre de notifications non lues
  useEffect(() => {
    fetchUnreadCount()
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  // Fermer le dropdown si clic en dehors
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }
    
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropdown])

  async function fetchUnreadCount() {
    try {
      const res = await API.get('/api/notifications/unread-count')
      setUnreadCount(res.data.count || 0)
    } catch (err) {
      console.error('Failed to fetch unread count:', err)
    }
  }

  async function fetchNotifications() {
    setLoading(true)
    try {
      const res = await API.get('/api/notifications?limit=10')
      setNotifications(res.data.notifications || [])
      setUnreadCount(res.data.unreadCount || 0)
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    } finally {
      setLoading(false)
    }
  }

  async function toggleDropdown() {
    if (!showDropdown) {
      await fetchNotifications()
    }
    setShowDropdown(!showDropdown)
  }

  async function markAsRead(notificationId) {
    try {
      await API.patch(`/api/notifications/${notificationId}/read`)
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Failed to mark as read:', err)
    }
  }

  async function markAllAsRead() {
    try {
      await API.patch('/api/notifications/read-all')
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error('Failed to mark all as read:', err)
    }
  }

  async function handleNotificationClick(notif) {
    // Marquer comme lue
    if (!notif.isRead) {
      await markAsRead(notif.id)
    }

    // Fermer le dropdown
    setShowDropdown(false)

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
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }

  return (
    <div className="notification-bell-container" ref={dropdownRef}>
      <button 
        className="notification-bell-button" 
        onClick={toggleDropdown}
        aria-label="Notifications"
      >
        <BellIcon className="notification-bell-icon" />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {showDropdown && (
        <div className="notification-dropdown">
          <div className="notification-dropdown-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button 
                className="mark-all-read-btn" 
                onClick={markAllAsRead}
              >
                Tout marquer comme lu
              </button>
            )}
          </div>

          <div className="notification-list">
            {loading && (
              <div className="notification-loading">Chargement...</div>
            )}

            {!loading && notifications.length === 0 && (
              <div className="notification-empty">
                <p>🎉 Aucune notification</p>
              </div>
            )}

            {!loading && notifications.map(notif => (
              <div 
                key={notif.id} 
                className={`notification-item ${!notif.isRead ? 'unread' : ''}`}
                onClick={() => handleNotificationClick(notif)}
              >
                <div className="notification-icon">
                  {getNotificationIcon(notif.type)}
                </div>
                <div className="notification-content">
                  <p className="notification-message">{notif.message}</p>
                  <span className="notification-time">{formatTime(notif.createdAt)}</span>
                </div>
                {!notif.isRead && <div className="notification-unread-dot"></div>}
              </div>
            ))}
          </div>

          {notifications.length > 0 && (
            <div className="notification-dropdown-footer">
              <a href="/notifications" className="view-all-link">
                Voir toutes les notifications
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
