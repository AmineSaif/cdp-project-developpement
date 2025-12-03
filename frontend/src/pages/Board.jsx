import React, { useEffect, useState } from 'react'
import API from '../services/api'
import IssueModal from '../components/IssueModal'
import CreateIssueModal from '../components/CreateIssueModal'
import CreateSprintModal from '../components/CreateSprintModal'
import { useProject } from '../context/ProjectContext'
import { useNavigate } from 'react-router-dom'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

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
  const [generating, setGenerating] = useState(false)

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

  // Génération PDF du sprint sélectionné
  const generateSprintPdf = async () => {
    if (!sprint) return;
    try { setGenerating(true) } catch {}
    try {
      const resSprint = await API.get(`/api/sprints/${sprint.id}`)
      const sprintData = resSprint.data?.sprint || resSprint.data
      const issuesRes = await API.get(`/api/sprints/${sprint.id}/issues`)
      const sprintIssues = Array.isArray(issuesRes.data) ? issuesRes.data : (issuesRes.data?.issues || [])

      // Préparer métriques détaillées
      const toLower = (v) => String(v || '').toLowerCase()
      const countBy = (arr, key) => arr.reduce((acc, it) => {
        const k = toLower(it[key])
        acc[k] = (acc[k] || 0) + 1
        return acc
      }, {})
      const statusCounts = countBy(sprintIssues, 'status')
      const typeCounts = countBy(sprintIssues, 'type')
      const priorityCounts = countBy(sprintIssues, 'priority')

      const done = sprintIssues.filter(i => toLower(i.status).includes('done')).length
      const inprogress = sprintIssues.filter(i => toLower(i.status).includes('progress')).length
      const inreview = sprintIssues.filter(i => toLower(i.status).includes('review')).length
      const todo = sprintIssues.filter(i => toLower(i.status).includes('to')).length

      const assigneeCounts = sprintIssues.reduce((acc, it) => {
        const name = it.assignee?.name || it.assigneeName || 'Non assignée'
        acc[name] = (acc[name] || 0) + 1
        return acc
      }, {})

      const doc = new jsPDF({ unit: 'pt', format: 'a4' })
      doc.setFontSize(16)
      doc.text(`Rapport du sprint: ${sprintData?.name || sprintData?.title || sprint?.name || 'Sprint'}`, 40, 40)
      doc.setFontSize(11)
      doc.text(`Projet: ${project?.name || '-'}`, 40, 60)
      doc.text(`Période: ${fmtDate(sprintData.startDate)} — ${fmtDate(sprintData.endDate)}`, 40, 75)
      doc.text(`Statut: ${sprintData.status || '-'}`, 300, 60)
      doc.text(`Issues totales: ${sprintIssues.length}`, 300, 75)

      // Vue d'ensemble statuts
      autoTable(doc, {
        startY: 95,
        head: [['Statut', 'Nombre']],
        body: [
          ['Terminées', done],
          ['En cours', inprogress],
          ['En révision', inreview],
          ['À faire', todo]
        ],
        styles: { fontSize: 10 }
      })

      // Répartition par type
      autoTable(doc, {
        margin: { top: 20 },
        head: [['Type', 'Nombre']],
        body: Object.entries(typeCounts).map(([k, v]) => [k || '-', v]),
        styles: { fontSize: 9 }
      })

      // Répartition par priorité
      autoTable(doc, {
        margin: { top: 20 },
        head: [['Priorité', 'Nombre']],
        body: Object.entries(priorityCounts).map(([k, v]) => [k || '-', v]),
        styles: { fontSize: 9 }
      })

      // Répartition par assigné
      autoTable(doc, {
        margin: { top: 20 },
        head: [['Assigné à', 'Nombre']],
        body: Object.entries(assigneeCounts).map(([k, v]) => [k || '-', v]),
        styles: { fontSize: 9 },
        columnStyles: { 0: { cellWidth: 220 } }
      })

      // Détails des issues
      autoTable(doc, {
        margin: { top: 30 },
        head: [['ID', 'Titre', 'Type', 'Priorité', 'Statut', 'Assignée à']],
        body: sprintIssues.map(i => [
          i.id,
          truncate(i.title || i.name, 40),
          i.type || '-',
          i.priority || '-',
          i.status || '-',
          i.assignee?.name || i.assigneeName || '-'
        ]),
        styles: { fontSize: 9 },
        columnStyles: { 1: { cellWidth: 220 } }
      })

      const fileName = (sprintData?.name || sprint?.name || `sprint-${sprint.id}`)
      doc.save(`rapport-sprint-${slug(fileName)}.pdf`)
    } catch (err) {
      console.error('Erreur génération PDF sprint:', err)
      alert('Impossible de générer le PDF du sprint.')
    } finally {
      try { setGenerating(false) } catch {}
    }
  }

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
            <button className="btn btn-secondary" disabled={!sprint || generating} onClick={generateSprintPdf}>
              {generating ? 'Génération...' : '🧾 Rapport PDF du sprint'}
            </button>
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

function fmtDate(d) {
  if (!d) return '-'
  try { return new Date(d).toLocaleDateString() } catch { return '-' }
}

function truncate(str, n) {
  if (!str) return ''
  return str.length > n ? str.slice(0, n - 1) + '…' : str
}

function slug(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
}
