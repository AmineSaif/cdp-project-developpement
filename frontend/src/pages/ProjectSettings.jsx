import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProject } from '../context/ProjectContext'
import { useAuth } from '../context/AuthContext'
import API from '../services/api'

export default function ProjectSettings() {
  const { project, setProject, clearSelection } = useProject()
  const { user } = useAuth()
  const [canEdit, setCanEdit] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState('')

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [joinLocked, setJoinLocked] = useState(false)

  const nav = useNavigate()

  useEffect(() => {
    if (!project) {
      nav('/projects')
      return
    }
    setName(project.name || '')
    setDescription(project.description || '')
    setJoinLocked(!!project.joinLocked)

    // Vérifier si l'utilisateur est propriétaire: tentative d'accès au GET /api/projects/:id
    // Cette route ne renvoie le projet que pour le propriétaire (sinon 404/403)
    async function checkOwner() {
      setLoading(true)
      setError(null)
      try {
        await API.get(`/api/projects/${project.id}`)
        setCanEdit(true)
      } catch (e) {
        setCanEdit(false)
      } finally {
        setLoading(false)
      }
    }
    checkOwner()
  }, [project, nav])

  async function handleSave(e) {
    e.preventDefault()
    if (!project) return
    setSaving(true)
    setError(null)
    setSuccess('')
    try {
      const res = await API.patch(`/api/projects/${project.id}`, {
        name,
        description
      })
      // Mettre à jour le contexte projet (nom/description)
      if (res.data?.project) {
        setProject({ ...project, ...res.data.project })
      } else {
        setProject({ ...project, name, description })
      }
      setSuccess('Paramètres enregistrés avec succès.')
    } catch (err) {
      console.error('Failed to update project:', err)
      setError(err.response?.data?.error || 'Erreur lors de la mise à jour du projet')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!project) return
    const confirmed = window.confirm(`Supprimer le projet "${project.name}" ?\nCette action est définitive.`)
    if (!confirmed) return

    try {
      await API.delete(`/api/projects/${project.id}`)
      // Nettoyer la sélection et rediriger
      clearSelection()
      nav('/projects')
    } catch (err) {
      console.error('Failed to delete project:', err)
      alert(err.response?.data?.error || 'Erreur lors de la suppression du projet')
    }
  }

  async function handleRegenerateCode() {
    if (!project) return
    try {
      const res = await API.post(`/api/projects/${project.id}/regenerate-code`)
      const newCode = res.data?.projectCode
      if (newCode) {
        setProject({ ...project, projectCode: newCode })
        setSuccess('Nouveau code généré avec succès.')
      }
    } catch (err) {
      console.error('Failed to regenerate code:', err)
      alert(err.response?.data?.error || 'Erreur lors de la régénération du code')
    }
  }

  async function handleToggleJoinLock() {
    if (!project) return
    try {
      const res = await API.patch(`/api/projects/${project.id}/join-lock`, { joinLocked: !joinLocked })
      const updated = res.data?.project
      setJoinLocked(!joinLocked)
      if (updated) setProject({ ...project, ...updated })
      setSuccess(!joinLocked ? 'Inscriptions désactivées.' : 'Inscriptions activées.')
    } catch (err) {
      console.error('Failed to toggle join lock:', err)
      alert(err.response?.data?.error || 'Erreur lors de la mise à jour du verrouillage des inscriptions')
    }
  }

  async function handleCopyCode() {
    try {
      await navigator.clipboard.writeText(project.projectCode || '')
      setSuccess('Code copié dans le presse-papiers')
      setTimeout(() => setSuccess(''), 1200)
    } catch (e) {
      console.error('Clipboard error:', e)
    }
  }

  if (!project) return null

  return (
    <div className="project-settings-page">
      <div className="page-header">
        <h1>Paramètres du projet</h1>
        <p className="text-muted">Code: {project.projectCode}</p>
      </div>

      {loading ? (
        <div className="loading-container"><p>Vérification des droits...</p></div>
      ) : (
        <>
          {!canEdit && (
            <div className="error-message" style={{ marginBottom: '1.5rem' }}>
              Accès réservé au propriétaire du projet. Vous pouvez consulter mais pas modifier.
            </div>
          )}

          <form className="settings-card" onSubmit={handleSave}>
            <h2 className="settings-section-title">Informations générales</h2>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="settings-form-group">
              <label htmlFor="name" className="settings-label">Nom du projet</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="form-input"
                placeholder="Entrez un nom"
                disabled={!canEdit}
                required
              />
            </div>

            <div className="settings-form-group">
              <label htmlFor="description" className="settings-label">Description</label>
              <textarea
                id="description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="form-input"
                placeholder="Description (optionnel)"
                disabled={!canEdit}
                rows={4}
              />
            </div>

            <div className="settings-actions">
              <button type="submit" className="btn" disabled={!canEdit || saving}>
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>

          <div className="settings-card">
            <h2 className="settings-section-title">Code du projet</h2>
            <div className="settings-code-row">
              <input
                type="text"
                readOnly
                value={project.projectCode || ''}
                className="form-input settings-code-input"
              />
              <button type="button" className="btn" onClick={handleCopyCode}>Copier</button>
              <button type="button" className="btn btn-outline" onClick={handleRegenerateCode} disabled={!canEdit}>
                Générer un nouveau code
              </button>
            </div>
          </div>

          <div className="settings-card">
            <h2 className="settings-section-title">Inscriptions</h2>
            <p className="settings-description">Permettre aux utilisateurs de rejoindre via le code du projet.</p>
            <div className="settings-actions">
              <button type="button" className="btn btn-outline" onClick={handleToggleJoinLock} disabled={!canEdit}>
                {joinLocked ? 'Activer les inscriptions' : 'Désactiver les inscriptions'}
              </button>
              <span className="settings-status">Statut: {joinLocked ? 'désactivées' : 'activées'}</span>
            </div>
          </div>

          <div className="settings-card settings-danger-zone">
            <h2 className="settings-section-title">Zone dangereuse</h2>
            <p className="settings-description">La suppression d'un projet est irréversible.</p>
            <div className="settings-actions">
              <button className="btn btn-danger" onClick={handleDelete} disabled={!canEdit}>
                Supprimer le projet
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
