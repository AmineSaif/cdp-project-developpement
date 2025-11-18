import React, { useState } from 'react'
import API from '../services/api'
import { useNavigate } from 'react-router-dom'
import Card from '../components/Card'
import Button from '../components/Button'
import { useAuth } from '../context/AuthContext'

export default function Register({ onSuccess }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState(null)
  const nav = useNavigate()

  const auth = useAuth()

  async function submit(e) {
    e.preventDefault()
    try {
  const res = await API.post('/api/auth/register', form)
  auth.login(res.data.token)
  if (onSuccess && typeof onSuccess === 'function') onSuccess(res.data)
  else nav('/app')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <Card>
        <h2 className="text-xl font-semibold mb-3">Create account</h2>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-sm text-slate-700">Name</label>
            <input className="w-full mt-1 p-2 border rounded" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm text-slate-700">Email</label>
            <input className="w-full mt-1 p-2 border rounded" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm text-slate-700">Password</label>
            <input className="w-full mt-1 p-2 border rounded" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          </div>
          <div className="flex justify-end">
            <Button type="submit">Register</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
