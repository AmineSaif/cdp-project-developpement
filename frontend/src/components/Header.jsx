import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { UserCircleIcon, Squares2X2Icon, ChevronDownIcon } from '@heroicons/react/24/solid'

export default function Header() {
  const nav = useNavigate()
  const auth = useAuth()
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  function logout() {
    auth.logout()
    nav('/')
  }

  return (
    <header className="header">
      <div className="header-inner">
        <div className="brand">
          
            <Squares2X2Icon className="brand-icon" />
            <span className="brand-title">AMA</span>
          
        </div>
        <nav className="nav">
          <Link to="/app" className="nav-link">Board</Link>
          {!auth.isAuthenticated ? (
            <>
              <Link to="/register" className="nav-cta">Register</Link>
              <Link to="/login" className="nav-cta">Login</Link>
            </>
          ) : (
            <div className="nav-user">
              <div className="user-dropdown">
                <button 
                  className="user-box"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <div className="avatar">
                    {auth.user?.name ? auth.user.name.split(' ').map(n => n[0]).slice(0,2).join('') : <UserCircleIcon className="avatar-icon" />}
                  </div>
                  <div className="user-meta">
                    <div className="user-name">{auth.user?.name || auth.user?.email}</div>
                    <div className="user-role">{auth.user?.role || ''}</div>
                  </div>
                  <ChevronDownIcon className="w-4 h-4" />
                </button>
                
                {userMenuOpen && (
                  <div className="user-menu">
                    <Link 
                      to="/app/profile" 
                      className="user-menu-item"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      👤 Mon profil
                    </Link>
                    <button 
                      onClick={logout} 
                      className="user-menu-item"
                    >
                      🚪 Se déconnecter
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
