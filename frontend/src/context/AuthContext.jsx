import React from 'react'
import { setToken as setApiToken } from '../services/api'
import API from '../services/api'

const AuthContext = React.createContext(null)

export function AuthProvider({ children }) {
  const [token, setTokenState] = React.useState(() => {
    try { return localStorage.getItem('token') } catch (e) { return null }
  })

  const [user, setUser] = React.useState(null)

  React.useEffect(() => {
    // keep axios header in sync
    setApiToken(token)
  }, [token])

  // when token changes, fetch current user
  React.useEffect(() => {
    let mounted = true
    async function fetchMe() {
      if (!token) {
        setUser(null)
        return
      }
      try {
        const res = await API.get('/api/auth/me')
        if (mounted) setUser(res.data)
      } catch (err) {
        console.error('Error fetching user:', err)
        if (mounted) {
          setUser(null)
          // If token is invalid (401), clear it
          if (err.response && err.response.status === 401) {
            console.log('Token invalide, nettoyage automatique')
            setTokenState(null)
            try { localStorage.removeItem('token') } catch (e) {}
          }
        }
      }
    }
    fetchMe()
    return () => { mounted = false }
  }, [token])

  function login(newToken) {
    setTokenState(newToken)
    try { localStorage.setItem('token', newToken) } catch (e) {}
  }

  function logout() {
    setTokenState(null)
    setUser(null)
    try { localStorage.removeItem('token') } catch (e) {}
  }

  return (
    <AuthContext.Provider value={{ token, user, setUser, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return React.useContext(AuthContext)
}

export default AuthContext
