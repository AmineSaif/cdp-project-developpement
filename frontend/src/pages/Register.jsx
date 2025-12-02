import React, { useState } from 'react'
import API from '../services/api'
import { useNavigate } from 'react-router-dom'
import Card from '../components/Card'
import Button from '../components/Button'
import { useAuth } from '../context/AuthContext'

export default function Register({ onSuccess }) {
  // Nouveau: projectCode optionnel (remplace teamCode)
  const [form, setForm] = useState({ name: '', email: '', password: '', projectCode: '' })
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const nav = useNavigate()

  const auth = useAuth()

  async function submit(e) {
    e.preventDefault()
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        projectCode: form.projectCode ? form.projectCode.trim().toLowerCase() : undefined
      }
      const res = await API.post('/api/auth/register', payload)
      auth.login(res.data.token)
      // Si nouveau projet créé => renvoyer son code
      if (res.data.user.projectCode) {
        setSuccess(`Projet créé ! Code projet à partager : ${res.data.user.projectCode}`)
        setTimeout(() => {
          if (onSuccess) onSuccess(res.data)
          else nav('/app')
        }, 3000)
      } else {
        if (onSuccess) onSuccess(res.data)
        else nav('/app')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 px-4">
      <Card className="auth-card">
        <h2 className="text-xl font-semibold mb-3">Create account</h2>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        {success && <div className="text-green-600 mb-2">{success}</div>}
        <form onSubmit={submit} className="space-y-3">
          <div className='margin-top-1'>
            <label className="block text-sm text-slate-700">Name</label>
            <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className='margin-top-1'>
            <label className="block text-sm text-slate-700">Email</label>
            <input className="form-input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className='margin-top-1'>
            <label className="block text-sm text-slate-700">Password</label>
            <input className="form-input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          </div>
          <div className='margin-top-1'>
            <label className="block text-sm text-slate-700">Code projet (optionnel)</label>
            <input 
              className="form-input" 
              placeholder="Laissez vide pour créer un nouveau projet"
              value={form.projectCode} 
              onChange={e => setForm({ ...form, projectCode: e.target.value })} 
            />
            <p className="text-xs text-slate-500 mt-1">
              Entrez un code pour rejoindre un projet existant, ou laissez vide pour créer client + projet + sprint initial.
            </p>
          </div>
          <div>
            <Button type="submit" className="w-full margin-top-1">Register</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
