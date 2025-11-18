import axios from 'axios'

const API = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000' })

export function setToken(token) {
  if (token) {
    API.defaults.headers.common['Authorization'] = `Bearer ${token}`
    try { localStorage.setItem('token', token) } catch (e) { /* ignore */ }
  } else {
    delete API.defaults.headers.common['Authorization']
    try { localStorage.removeItem('token') } catch (e) { /* ignore */ }
  }
}

// initialize from localStorage
try {
  const t = localStorage.getItem('token')
  if (t) API.defaults.headers.common['Authorization'] = `Bearer ${t}`
} catch (e) { /* ignore */ }

export default API
