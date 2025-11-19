import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import API from '../services/api'
import Card from '../components/Card'

export default function IssueDetails() {
  const { id } = useParams()
  const [issue, setIssue] = useState(null)

  useEffect(() => {
    if (!id) return
    API.get(`/api/issues/${id}`).then(res => setIssue(res.data)).catch(console.error)
  }, [id])

  if (!issue) return <div className="text-center py-10">Loading...</div>

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <Card>
        <h2 className="text-2xl font-bold">{issue.title}</h2>
        <p className="mt-3 text-slate-700">{issue.description}</p>
        <div className="mt-4 text-sm text-slate-600">Type: {issue.type} • Priority: {issue.priority} • Status: {issue.status}</div>
      </Card>
    </div>
  )
}
