import React, { useState } from 'react'
import API from '../services/api'

export default function CreateSprintModal({ onClose, onCreated, projectId }) {
  const [form, setForm] = useState({ 
    name: '', 
    description: '', 
    startDate: '', 
    endDate: '' 
  })
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  function change(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function save() {
    if (!form.name.trim()) {
      setError('Le nom du sprint est requis')
      return
    }
    if (!projectId) {
      setError('Aucun projet sélectionné')
      return
    }

    setSaving(true)
    try {
      const payload = { ...form, projectId }
      const res = await API.post('/api/sprints', payload)
      onCreated && onCreated(res.data.sprint)
      onClose && onClose()
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la création')
    } finally { 
      setSaving(false) 
    }
  }

  return (
    <div className="modal-root" role="dialog" aria-modal="true">
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-card">
        <div className="modal-header">
          <h3>Créer un nouveau sprint</h3>
          <button className="btn btn-outline" onClick={onClose}>Fermer</button>
        </div>
        {error && <div className="text-red-600 mt-2">{error}</div>}
        
        <div className="modal-body">
          <label className="block text-sm">Nom du sprint</label>
          <input 
            className="w-full mt-1 p-2 border rounded" 
            value={form.name || ''} 
            onChange={e => change('name', e.target.value)} 
            placeholder="Ex: Sprint 2, Phase de tests..." 
          />

          <label className="block text-sm mt-3">Description (optionnel)</label>
          <textarea 
            className="w-full mt-1 p-2 border rounded" 
            rows={3} 
            value={form.description || ''} 
            onChange={e => change('description', e.target.value)} 
            placeholder="Objectifs de ce sprint..." 
          />

          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <label className="block text-sm">Date de début (optionnel)</label>
              <input 
                type="date"
                className="w-full mt-1 p-2 border rounded" 
                value={form.startDate || ''} 
                onChange={e => change('startDate', e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-sm">Date de fin (optionnel)</label>
              <input 
                type="date"
                className="w-full mt-1 p-2 border rounded" 
                value={form.endDate || ''} 
                onChange={e => change('endDate', e.target.value)} 
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button className="btn btn-outline" onClick={onClose}>Annuler</button>
            <button className="btn" onClick={save} disabled={saving}>
              {saving ? 'Création...' : 'Créer le sprint'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
