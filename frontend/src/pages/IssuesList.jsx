import React, { useEffect, useState } from 'react'
import API from '../services/api'
import { Link } from 'react-router-dom'
import Card from '../components/Card'
import IssueModal from '../components/IssueModal'

export default function IssuesList() {
  const [issues, setIssues] = useState([])
  const [selected, setSelected] = useState(null)
  const [myIssuesOnly, setMyIssuesOnly] = useState(false)

  useEffect(() => {
    fetchIssues()
  }, [myIssuesOnly])

  function fetchIssues() {
    const url = myIssuesOnly ? '/api/issues?myIssuesOnly=true' : '/api/issues'
    API.get(url).then(res => setIssues(res.data)).catch(console.error)
  }

  return (
    <div className="max-w-5xl mx-auto mt-8 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Issues</h2>
        <div className="flex gap-2">
          <button 
            className={`btn ${myIssuesOnly ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setMyIssuesOnly(!myIssuesOnly)}
          >
            {myIssuesOnly ? '✅ Mes issues' : '👥 Toutes les issues'}
          </button>
          <Link to="/create" className="text-indigo-600 hover:underline">+ New Issue</Link>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {issues.map(i => (
          <Card key={i.id} className="hover:shadow-lg transition" onClick={() => setSelected(i.id)}>
            <div className="text-lg font-semibold text-slate-800" style={{cursor:'pointer'}} onClick={() => setSelected(i.id)}>{i.title}</div>
            <p className="text-sm text-slate-500">{i.description}</p>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="px-2 py-1 bg-slate-100 rounded">{i.type}</span>
              <span className="text-slate-600">Status: {i.status}</span>
            </div>
          </Card>
        ))}
      </div>

      {selected && (
        <IssueModal issueId={selected} onClose={() => setSelected(null)} onSaved={(updated) => {
          setIssues(prev => prev.map(it => it.id === updated.id ? updated : it))
        }} />
      )}
    </div>
  )
}
