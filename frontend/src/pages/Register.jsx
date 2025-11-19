import React, { useState } from 'react'
import API from '../services/api'
import { useNavigate } from 'react-router-dom'
import Card from '../components/Card'
import Button from '../components/Button'
import { useAuth } from '../context/AuthContext'

export default function Register({ onSuccess }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', teamCode: '' })
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const nav = useNavigate()

  const auth = useAuth()

  async function submit(e) {
    e.preventDefault()
    try {
      const res = await API.post('/api/auth/register', form)
      auth.login(res.data.token)
      
      // Si un code d'équipe a été généré (nouvelle équipe)
      if (res.data.user.teamCode) {
        setSuccess(`Équipe créée ! Votre code d'invitation : ${res.data.user.teamCode}`)
        setTimeout(() => {
          if (onSuccess && typeof onSuccess === 'function') onSuccess(res.data)
          else nav('/app')
        }, 3000)
      } else {
        if (onSuccess && typeof onSuccess === 'function') onSuccess(res.data)
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
            <label className="block text-sm text-slate-700">Code d'équipe (optionnel)</label>
            <input 
              className="form-input" 
              placeholder="Laissez vide pour créer une nouvelle équipe"
              value={form.teamCode} 
              onChange={e => setForm({ ...form, teamCode: e.target.value.toUpperCase() })} 
            />
            <p className="text-xs text-slate-500 mt-1">
              Entrez un code pour rejoindre une équipe, ou laissez vide pour en créer une nouvelle
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
