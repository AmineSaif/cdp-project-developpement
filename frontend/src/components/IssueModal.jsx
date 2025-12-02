import React, { useEffect, useState } from 'react'
import API from '../services/api'

export default function IssueModal({ issueId, onClose, onSaved, onDeleted, projectId }) {
  const [issue, setIssue] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState(null)
  const [teamMembers, setTeamMembers] = useState([])

  useEffect(() => {
    if (!issueId) return
    setLoading(true)
    API.get(`/api/issues/${issueId}`).then(res => setIssue(res.data)).catch(err => setError('Failed to load')).finally(() => setLoading(false))
    
    // Charger les membres du projet pour l'assignation
    if (projectId) fetchProjectMembers()
  }, [issueId, projectId])

  async function fetchProjectMembers() {
    try {
      const res = await API.get(`/api/projects/${projectId}/members`)
      setTeamMembers(res.data.members || [])
    } catch (err) {
      console.error('Failed to fetch project members:', err)
    }
  }

  if (!issueId) return null

  function change(field, value) {
    setIssue(prev => ({ ...prev, [field]: value }))
  }

  async function save() {
    setSaving(true)
    try {
      const res = await API.patch(`/api/issues/${issueId}`, { 
        title: issue.title, 
        description: issue.description, 
        status: issue.status, 
        type: issue.type, 
        priority: issue.priority,
        assigneeId: issue.assigneeId || null
      })
      onSaved && onSaved(res.data)
      onClose && onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed')
    } finally { setSaving(false) }
  }

  async function deleteIssue() {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette issue ?')) return
    
    setDeleting(true)
    try {
      // Use POST to /delete endpoint
      await API.post(`/api/issues/${issueId}/delete`)
      onDeleted && onDeleted(issueId)
      onClose && onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed')
    } finally { setDeleting(false) }
  }

  return (
    <div className="modal-root" role="dialog" aria-modal="true">
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-card">
        <div className="modal-header">
          <h3>{loading ? 'Loading...' : (issue?.title || 'Issue')}</h3>
          <button className="btn btn-outline" onClick={onClose}>Close</button>
        </div>
        {error && <div className="text-red-600">{error}</div>}
        {!loading && issue && (
          <div className="modal-body">
            <label className="block text-sm">Title</label>
            <input className="w-full mt-1 p-2 border rounded" value={issue.title || ''} onChange={e => change('title', e.target.value)} />

            <label className="block text-sm mt-3">Description</label>
            <textarea className="w-full mt-1 p-2 border rounded" rows={6} value={issue.description || ''} onChange={e => change('description', e.target.value)} />

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-sm">Type</label>
                <select className="w-full mt-1 p-2 border rounded" value={issue.type || ''} onChange={e => change('type', e.target.value)}>
                  <option value="task">Task</option>
                  <option value="feature">Feature</option>
                  <option value="bug">Bug</option>
                </select>
              </div>
              <div>
                <label className="block text-sm">Priority</label>
                <select className="w-full mt-1 p-2 border rounded" value={issue.priority || ''} onChange={e => change('priority', e.target.value)}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            {/* Assignation */}
            <div className="mt-3">
              <label className="block text-sm">Assigné à</label>
              <select 
                className="w-full mt-1 p-2 border rounded" 
                value={issue.assigneeId || ''} 
                onChange={e => change('assigneeId', e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">Non assigné</option>
                {teamMembers.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.name} ({member.email})
                  </option>
                ))}
              </select>
              {issue.assignee && (
                <div className="mt-2 text-sm text-slate-600">
                  👤 Actuellement assigné à : <strong>{issue.assignee.name}</strong>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-slate-600">Status</div>
              <select className="mt-1 p-2 border rounded" value={issue.status || ''} onChange={e => change('status', e.target.value)}>
                <option value="todo">To Do</option>
                <option value="inprogress">In Progress</option>
                <option value="inreview">In Review</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div className="mt-4 flex justify-between">
              <button 
                className="btn btn-danger" 
                onClick={deleteIssue} 
                disabled={deleting || saving}
              >
                {deleting ? 'Deleting...' : '🗑️ Delete'}
              </button>
              <div className="flex gap-2">
                <button className="btn btn-outline" onClick={onClose}>Cancel</button>
                <button className="btn" onClick={save} disabled={saving || deleting}>{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
