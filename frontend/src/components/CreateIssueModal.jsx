import React, { useState } from 'react'
import API from '../services/api'

export default function CreateIssueModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ title: '', description: '', type: 'task', priority: 'low' })
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  function change(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function save() {
    if (!form.title.trim()) {
      setError('Title is required')
      return
    }
    setSaving(true)
    try {
      const res = await API.post('/api/issues', { ...form, status: 'todo' })
      onCreated && onCreated(res.data)
      onClose && onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Create failed')
    } finally { setSaving(false) }
  }

  return (
    <div className="modal-root" role="dialog" aria-modal="true">
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-card">
        <div className="modal-header">
          <h3>Create New Issue</h3>
          <button className="btn btn-outline" onClick={onClose}>Close</button>
        </div>
        {error && <div className="text-red-600">{error}</div>}
        
        <div className="modal-body">
          <label className="block text-sm">Title</label>
          <input className="w-full mt-1 p-2 border rounded" value={form.title || ''} onChange={e => change('title', e.target.value)} placeholder="Enter issue title..." />

          <label className="block text-sm mt-3">Description</label>
          <textarea className="w-full mt-1 p-2 border rounded" rows={4} value={form.description || ''} onChange={e => change('description', e.target.value)} placeholder="Describe the issue..." />

          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <label className="block text-sm">Type</label>
              <select className="w-full mt-1 p-2 border rounded" value={form.type || ''} onChange={e => change('type', e.target.value)}>
                <option value="task">Task</option>
                <option value="feature">Feature</option>
                <option value="bug">Bug</option>
              </select>
            </div>
            <div>
              <label className="block text-sm">Priority</label>
              <select className="w-full mt-1 p-2 border rounded" value={form.priority || ''} onChange={e => change('priority', e.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button className="btn" onClick={save} disabled={saving}>{saving ? 'Creating...' : 'Create Issue'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}