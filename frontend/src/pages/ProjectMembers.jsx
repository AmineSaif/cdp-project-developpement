import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProject } from '../context/ProjectContext'
import { TrashIcon } from '@heroicons/react/24/outline'
import API from '../services/api'

export default function ProjectMembers() {
  const { project } = useProject()
  const [members, setMembers] = useState([])
  const [isOwner, setIsOwner] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const nav = useNavigate()

  useEffect(() => {
    if (!project) {
      nav('/projects')
      return
    }
    fetchMembers()
  }, [project, nav])

  async function fetchMembers() {
    if (!project?.id) return
    
    setLoading(true)
    setError(null)
    try {
      const res = await API.get(`/api/projects/${project.id}/members`)
      setMembers(res.data.members || [])
      setIsOwner(res.data.isOwner || false)
    } catch (err) {
      console.error('Failed to fetch members:', err)
      setError('Erreur lors du chargement des membres')
    } finally {
      setLoading(false)
    }
  }

  async function handleRemoveMember(memberId, memberName) {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ${memberName} du projet ?`)) {
      return
    }

    try {
      await API.delete(`/api/projects/${project.id}/members/${memberId}`)
      // Rafraîchir la liste des membres
      fetchMembers()
    } catch (err) {
      console.error('Failed to remove member:', err)
      alert(err.response?.data?.error || 'Erreur lors de la suppression du membre')
    }
  }

  function formatDate(dateString) {
    if (!dateString) return 'Date inconnue'
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  if (!project) return null

  return (
    <div className="project-members-page">
      <div className="page-header">
        <h1>Membres du projet</h1>
        <p className="text-muted">{members.length} membre{members.length > 1 ? 's' : ''}</p>
      </div>

      {loading && (
        <div className="loading-container">
          <p>Chargement des membres...</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="members-grid">
          {members.map(member => (
            <div key={member.id} className="member-card">
              <div className="member-card-left">
                <div className="member-avatar">
                  <span className="member-avatar-text">
                    {member.name?.charAt(0).toUpperCase() || member.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="member-info">
                  <h3 className="member-name">{member.name}</h3>
                  <p className="member-email">{member.email}</p>
                  <span className="member-role">
                    {member.role === 'owner' ? 'Propriétaire' : 'Membre'}
                  </span>
                </div>
              </div>
              <div className="member-card-right">
                {isOwner && member.role !== 'owner' && (
                  <button
                    className="remove-member-btn"
                    onClick={() => handleRemoveMember(member.id, member.name)}
                    title="Supprimer ce membre"
                  >
                    <TrashIcon className="icon-sm" />
                  </button>
                )}
                <span className="member-joined">
                  Rejoint le {formatDate(member.joinedAt)}
                </span>
              </div>
            </div>
          ))}

          {members.length === 0 && (
            <div className="empty-state">
              <p>Aucun membre dans ce projet</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
