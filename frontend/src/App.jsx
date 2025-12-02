import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from './components/Header'
import ProjectSidebar from './components/ProjectSidebar'
import { useProject } from './context/ProjectContext'

export default function App() {
  const [logged, setLogged] = React.useState(() => {
    try { return !!localStorage.getItem('token') } catch (e) { return false }
  })
  const { project } = useProject()

  return (
    <div className="app-root">
      <Header logged={logged} setLogged={setLogged} />
      <div className="app-container">
        {project && <ProjectSidebar />}
        <main className="app-main">
          <Outlet />
        </main>
      </div>
      <footer className="app-footer">
        <div>© {new Date().getFullYear()} AMA</div>
      </footer>
    </div>
  )
}
