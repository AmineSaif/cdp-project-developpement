import React, { useState } from 'react'
import Login from './Login'
import Register from './Register'
import { useNavigate } from 'react-router-dom'

export default function Landing() {
  const [tab, setTab] = useState('login')
  const nav = useNavigate()

  function handleSuccess() {
    nav('/app')
  }

  return (
    <div className="landing-root">
      <div className="landing-hero">
        <div className="hero-card">
          <div className="hero-split">
            <div className="hero-left">
                <h2 className="hero-welcome">Welcome to AMA</h2>
              <div className="hero-illustration" role="img" aria-label="Collaboration illustration">
                {/* Place your illustration at src/assets/landing-illustration.png */}
              </div>
              
              <p className="hero-caption">Collaborate, track and ship — all in one simple board.</p>
            </div>
            <div className="hero-right">
              <div className="tabs" role="tablist" aria-label="Auth tabs">
                <button className={"tab " + (tab === 'login' ? 'tab--active' : '')} onClick={() => setTab('login')}>Login</button>
                <button className={"tab " + (tab === 'register' ? 'tab--active' : '')} onClick={() => setTab('register')}>Register</button>
              </div>

              <div className="tab-panel" role="tabpanel">
                {tab === 'login' && <Login onSuccess={handleSuccess} />}
                {tab === 'register' && <Register onSuccess={handleSuccess} />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
