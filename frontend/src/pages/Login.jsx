import React, { useState } from 'react'
import API from '../services/api'
import { useNavigate } from 'react-router-dom'
import Card from '../components/Card'
import Button from '../components/Button'
import { useAuth } from '../context/AuthContext'

export default function Login({ onSuccess }) {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState(null)
  const nav = useNavigate()
  const auth = useAuth()

  async function submit(e) {
    e.preventDefault()
    try {
  const res = await API.post('/api/auth/login', form)
  // update context
  auth.login(res.data.token)
  if (onSuccess && typeof onSuccess === 'function') onSuccess(res.data)
  else nav('/app')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <Card>
        <h2 className="text-xl font-semibold mb-3">Login</h2>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-sm text-slate-700">Email</label>
            <input className="w-full mt-1 p-2 border rounded" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm text-slate-700">Password</label>
            <input className="w-full mt-1 p-2 border rounded" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          </div>
          <div className="flex justify-end">
            <Button type="submit">Login</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
