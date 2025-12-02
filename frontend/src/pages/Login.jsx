

import React, { useState } from 'react'
import API from '../services/api'
import { useNavigate } from 'react-router-dom'
import Card from '../components/Card'
import Button from '../components/Button'
import { useAuth } from '../context/AuthContext'
import { useProject } from '../context/ProjectContext'

export default function Login({ onSuccess }) {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState(null)
  const nav = useNavigate()
  const auth = useAuth()
  const { clearSelection } = useProject()

  async function submit(e) {
    e.preventDefault()
    try {
      const res = await API.post('/api/auth/login', form)
      // update context
      auth.login(res.data.token)
      clearSelection() // Vide le contexte projet/sprint à chaque login
      if (onSuccess && typeof onSuccess === 'function') onSuccess(res.data)
      else nav('/projects')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 px-4">
      <Card className="auth-card">
        <h2 className="text-xl font-semibold mb-3">Login</h2>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <form onSubmit={submit} className="space-y-3">
          <div className='margin-top-1'>
            <label className="block text-sm text-slate-700">Email</label>
            <input className="form-input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className='margin-top-1'>
            <label className="block text-sm text-slate-700">Password</label>
            <input className="form-input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          </div>
          <div>
            <Button type="submit" className="w-full margin-top-1">Login</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
