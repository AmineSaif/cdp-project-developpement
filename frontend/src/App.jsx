import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from './components/Header'

export default function App() {
  const [logged, setLogged] = React.useState(() => {
    try { return !!localStorage.getItem('token') } catch (e) { return false }
  })

  return (
    <div className="app-root">
      <Header logged={logged} setLogged={setLogged} />
      <main className="app-main">
        <Outlet />
      </main>
      <footer className="app-footer">
        <div>© {new Date().getFullYear()} AMA</div>
      </footer>
    </div>
  )
}
