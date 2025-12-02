import React, { useEffect, useState } from 'react'
import API from '../services/api'
import IssueModal from '../components/IssueModal'
import CreateIssueModal from '../components/CreateIssueModal'
import CreateSprintModal from '../components/CreateSprintModal'
import { useProject } from '../context/ProjectContext'
import { useNavigate } from 'react-router-dom'

const STATUS_KEYS = [
  { key: 'todo', label: 'To Do' },
  { key: 'inprogress', label: 'In Progress' },
  { key: 'inreview', label: 'In Review' },
  { key: 'done', label: 'Done' }
]

function normalizeStatus(s) {
  if (!s) return 'todo'
  const t = String(s).toLowerCase().replace(/ /g, '')
  if (t.includes('progress')) return 'inprogress'
  if (t.includes('review')) return 'inreview'
  if (t.startsWith('done') || t === 'closed') return 'done'
  if (t === 'todo' || t === 'to-do' || t === 'todo') return 'todo'
  return t
}

export default function Board() {
  const { project, sprint, setSprint } = useProject();
  const [issues, setIssues] = useState([])
  const [dragging, setDragging] = useState(null)
  const [overColumn, setOverColumn] = useState(null)
  const [error, setError] = useState(null)
  const [selected, setSelected] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showCreateSprintModal, setShowCreateSprintModal] = useState(false)
  const [myIssuesOnly, setMyIssuesOnly] = useState(false)
  const [sprints, setSprints] = useState([])
  const nav = useNavigate();

  // Redirection si aucun projet sélectionné
  useEffect(() => {
    if (!project) nav('/projects');
  }, [project, nav]);

  // Charger sprints quand le projet est disponible
  useEffect(() => {
    if (project) fetchSprints(project.id)
  }, [project])

  // Nettoyage quand le projet change (évite affichage ancien sprint / issues)
  useEffect(() => {
    setIssues([]);
    setSprints([]);
    // sprint est déjà remis à null dans setProject du contexte
  }, [project])

  // Charger issues quand sprint ou filtre change
  useEffect(() => {
    if (sprint) fetchIssues()
  }, [sprint, myIssuesOnly])

  async function fetchSprints(projectId) {
    try {
      const res = await API.get(`/api/sprints?projectId=${projectId}`)
      const list = res.data.sprints || []
      setSprints(list)
      if (list.length && !sprint) setSprint(list[0])
    } catch (err) { console.error(err); setError('Failed to load sprints') }
  }

  async function fetchIssues() {
    if (!sprint) return
    const base = `/api/issues?sprintId=${sprint.id}`
    const url = myIssuesOnly ? `${base}&myIssuesOnly=true` : base
    try {
      const res = await API.get(url)
      setIssues(res.data)
    } catch (err) { console.error(err); setError('Failed to load issues') }
  }

  function grouped() {
    const map = { todo: [], inprogress: [], inreview: [], done: [] }
    issues.forEach(i => {
      const s = normalizeStatus(i.status)
      if (!map[s]) map[s] = []
      map[s].push(i)
    })
    return map
  }

  function onDragStart(e, issue) {
    e.dataTransfer.setData('text/plain', String(issue.id))
    setDragging(issue.id)
  }

  function onDragOver(e) {
    e.preventDefault()
  }

  function onDrop(e, columnKey) {
    e.preventDefault()
    const id = e.dataTransfer.getData('text/plain')
    if (!id) return
    const issueId = Number(id)
    const updated = issues.map(it => it.id === issueId ? { ...it, status: columnKey } : it)
    setIssues(updated)

    // optimistic update to backend; assume PATCH /api/issues/:id accepts { status }
    API.patch(`/api/issues/${issueId}`, { status: columnKey }).catch(err => {
      console.error('Failed to update issue status', err)
      // rollback on error by refetching
      API.get('/api/issues').then(res => setIssues(res.data)).catch(console.error)
    })

    setDragging(null)
    setOverColumn(null)
  }

  function onDragEnter(e, key) { e.preventDefault(); setOverColumn(key) }
  function onDragLeave(e) { setOverColumn(null) }

  const cols = grouped()

  return (
    <div className="board-root">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Board - {project ? project.name : 'Aucun projet'}</h2>
          <div className="flex gap-2">
            <button
              className={`btn ${myIssuesOnly ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setMyIssuesOnly(!myIssuesOnly)}
            >{myIssuesOnly ? '✅ Mes issues' : '👥 Toutes les issues'}</button>
            <button className="btn" disabled={!sprint} onClick={() => setShowCreateModal(true)}>+ Issue</button>
            <button className="btn btn-outline" onClick={() => { setError(null); fetchIssues() }}>Refresh</button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold">Sprint</label>
            <div className="flex gap-2 mt-1">
              <select 
                className="flex-1 p-2 border rounded"
                value={sprint?.id || ''}
                onChange={e => {
                  const s = sprints.find(x => x.id === Number(e.target.value));
                  setSprint(s || null);
                }}>
                {sprints.length === 0 && <option value="">Aucun sprint</option>}
                {sprints.map(s => <option key={s.id} value={s.id}>{s.name} ({s.status})</option>)}
              </select>
              <button 
                className="btn" 
                onClick={() => setShowCreateSprintModal(true)}
                title="Créer un nouveau sprint"
              >
                + Sprint
              </button>
            </div>
          </div>
          {project?.projectCode && (
            <div className="text-xs mt-6 text-slate-600">Code projet: <span className="font-mono">{project.projectCode}</span></div>
          )}
        </div>
      </div>

      {error && <div className="max-w-5xl mx-auto mt-4 text-red-600">{error}</div>}

      <div className="board-columns mt-8">
        {STATUS_KEYS.map(s => (
          <div key={s.key} className={"board-column card " + (overColumn === s.key ? 'column--dragover' : '')}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, s.key)}
            onDragEnter={(e) => onDragEnter(e, s.key)}
            onDragLeave={onDragLeave}
          >
            <div className="board-column__header">
              <div>{s.label}</div>
              <div className="board-column__count">{(cols[s.key] || []).length}</div>
            </div>
            <div className="column-drop">
              {(cols[s.key] || []).map(i => (
                <div key={i.id}
                  draggable
                  onDragStart={(e) => onDragStart(e, i)}
                  className="issue-card"
                  onClick={() => setSelected(i.id)}
                >
                  <div className="issue-title">{i.title}</div>
                  <div className="issue-meta">
                    <div className="text-sm">{i.type || ''}</div>
                    <div className="text-sm">#{i.id}</div>
                  </div>
                  <div className={`issue-priority-bar priority-${(i.priority || 'low').toLowerCase()}`}></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selected && <IssueModal issueId={selected} projectId={sprint?.projectId} onClose={() => setSelected(null)} onSaved={(updated) => {
        // update local issue list with saved data
        setIssues(prev => prev.map(it => it.id === updated.id ? updated : it))
      }} onDeleted={(deletedId) => {
        // remove deleted issue from local state
        setIssues(prev => prev.filter(it => it.id !== deletedId))
      }} />}

      {showCreateModal && <CreateIssueModal sprintId={sprint?.id} projectId={sprint?.projectId} onClose={() => setShowCreateModal(false)} onCreated={(newIssue) => {
        setIssues(prev => [...prev, newIssue])
      }} />}

      {showCreateSprintModal && <CreateSprintModal projectId={project?.id} onClose={() => setShowCreateSprintModal(false)} onCreated={(newSprint) => {
        setSprints(prev => [...prev, newSprint])
        setSprint(newSprint)
        setShowCreateSprintModal(false)
      }} />}
    </div>
  )
}
