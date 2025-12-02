import React from 'react'
import { NavLink } from 'react-router-dom'
import { useProject } from '../context/ProjectContext'
import { 
  RectangleStackIcon, 
  UserGroupIcon, 
  ChartBarIcon,
  Cog6ToothIcon 
} from '@heroicons/react/24/outline'

export default function ProjectSidebar() {
  const { project } = useProject()

  if (!project) return null

  return (
    <aside className="project-sidebar">
      <div className="project-sidebar-header">
        <h3 className="project-sidebar-title">{project.name}</h3>
        <p className="project-sidebar-code">Code: {project.projectCode}</p>
      </div>

      <nav className="project-sidebar-nav">
        <NavLink 
          to="/app" 
          end
          className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
        >
          <RectangleStackIcon className="sidebar-nav-icon" />
          <span>Board</span>
        </NavLink>

        <NavLink 
          to="/app/members" 
          className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
        >
          <UserGroupIcon className="sidebar-nav-icon" />
          <span>Membres</span>
        </NavLink>

        <NavLink 
          to="/app/stats" 
          className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
        >
          <ChartBarIcon className="sidebar-nav-icon" />
          <span>Statistiques</span>
        </NavLink>

        <NavLink 
          to="/app/settings" 
          className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
        >
          <Cog6ToothIcon className="sidebar-nav-icon" />
          <span>Paramètres</span>
        </NavLink>
      </nav>
    </aside>
  )
}
