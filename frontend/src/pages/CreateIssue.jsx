import React, { useState } from 'react'
import API from '../services/api'
import { useNavigate } from 'react-router-dom'
import Card from '../components/Card'
import Button from '../components/Button'

export default function CreateIssue() {
  const [form, setForm] = useState({ title: '', description: '', type: 'task', priority: 'low' })
  const [error, setError] = useState(null)
  const nav = useNavigate()

  async function submit(e) {
    e.preventDefault()
    try {
      const res = await API.post('/api/issues', form)
      // navigate to nested app route
      nav(`/app/issues/${res.data.id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Create failed')
    }
  }

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <Card>
        <h2 className="text-xl font-semibold mb-3">Create Issue</h2>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-sm text-slate-700">Title</label>
            <input className="w-full mt-1 p-2 border rounded" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm text-slate-700">Description</label>
            <textarea className="w-full mt-1 p-2 border rounded" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-700">Type</label>
              <select className="w-full mt-1 p-2 border rounded" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="task">Task</option>
                <option value="feature">Feature</option>
                <option value="bug">Bug</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-700">Priority</label>
              <select className="w-full mt-1 p-2 border rounded" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit">Create</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
