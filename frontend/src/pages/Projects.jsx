import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import Header from '../components/Header';
import { Squares2X2Icon } from '@heroicons/react/24/solid';

export default function Projects() {
  const { user, logout } = useAuth();
  const { setProject, clearSelection } = useProject();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [clientId, setClientId] = useState(null); // owner client id for creation
  const [showJoin, setShowJoin] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinFeedback, setJoinFeedback] = useState(null);
  const nav = useNavigate();

  useEffect(() => {
    if (user) fetchProjects();
  }, [user]);

  async function fetchProjects() {
    setLoading(true);
    try {
      const res = await API.get('/api/projects');
      setProjects(res.data.projects || []);
      // Derive a clientId (first client of user) for creation convenience
      if (!clientId) {
        const first = res.data.projects?.[0]?.client;
        if (first) setClientId(first.id);
      }
    } catch (err) {
      setError('Impossible de charger les projets');
    } finally { setLoading(false); }
  }

  function selectProject(p) {
    setProject(p);
    nav('/app'); // board route
  }

  async function createProject() {
    if (!createForm.name.trim()) {
      setFeedback('Nom requis');
      return;
    }
    if (!clientId) {
      setFeedback('Client invalide (inscription devrait en avoir créé un)');
      return;
    }
    setCreating(true);
    setFeedback(null);
    try {
      const payload = { name: createForm.name, description: createForm.description, clientId };
      const res = await API.post('/api/projects', payload);
      setFeedback(`Projet créé. Code: ${res.data.projectCode}`);
      setProjects(prev => [res.data.project, ...prev]);
      setShowCreate(false);
      setCreateForm({ name: '', description: '' });
    } catch (err) {
      setFeedback(err.response?.data?.error || 'Erreur création projet');
    } finally { setCreating(false); }
  }

  async function joinProject() {
    if (!joinCode.trim()) {
      setJoinFeedback('Code requis');
      return;
    }
    setJoinLoading(true);
    setJoinFeedback(null);
    try {
      const res = await API.post('/api/projects/join', { projectCode: joinCode.trim() });
      const proj = res.data.project;
      // Ajouter le projet à la liste s'il n'y est pas déjà
      setProjects(prev => {
        const exists = prev.some(p => p.id === proj.id);
        return exists ? prev : [proj, ...prev];
      });
      setJoinFeedback('Projet rejoint. Ouverture...');
      // Sélection automatique après léger délai pour feedback
      setTimeout(() => {
        setShowJoin(false);
        setJoinCode('');
        setJoinFeedback(null);
        selectProject(proj);
      }, 800);
    } catch (err) {
      setJoinFeedback(err.response?.data?.error || 'Erreur lors de la jonction');
    } finally {
      setJoinLoading(false);
    }
  }

  async function leaveProject(projectId, e) {
    e.stopPropagation();
    if (!confirm('Voulez-vous vraiment quitter ce projet ?')) return;
    try {
      await API.post(`/api/projects/${projectId}/leave`);
      setProjects(prev => prev.filter(p => p.id !== projectId));
      setFeedback('Projet quitté avec succès');
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la sortie du projet');
    }
  }

  async function deleteProject(projectId, e) {
    e.stopPropagation();
    if (!confirm('Voulez-vous vraiment supprimer ce projet ? Cette action est irréversible.')) return;
    try {
      await API.delete(`/api/projects/${projectId}`);
      setProjects(prev => prev.filter(p => p.id !== projectId));
      setFeedback('Projet supprimé avec succès');
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la suppression du projet');
    }
  }

  return (
    <>
      <Header />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Squares2X2Icon className="w-8 h-8 text-blue-600" />
            Mes Projets
          </h1>
          <div className="flex gap-2">
            <Button onClick={() => setShowCreate(true)}>+ Nouveau Projet</Button>
            <Button className="btn-outline" onClick={() => setShowJoin(true)}>Rejoindre</Button>
            <Button className="btn-outline" onClick={fetchProjects}>Refresh</Button>
          </div>
        {showJoin && (
          <div className="modal-root" role="dialog" aria-modal="true">
            <div className="modal-backdrop" onClick={() => { setShowJoin(false); setJoinFeedback(null); }} />
            <div className="modal-card max-w-md">
              <div className="modal-header">
                <h3>Rejoindre un projet</h3>
                <button className="btn btn-outline" onClick={() => { setShowJoin(false); setJoinFeedback(null); }}>Fermer</button>
              </div>
              <div className="modal-body space-y-3">
                {joinFeedback && <div className="text-sm text-slate-700">{joinFeedback}</div>}
                <div>
                  <label className="block text-sm">Code du projet</label>
                  <input className="form-input font-mono" value={joinCode} onChange={e => setJoinCode(e.target.value)} placeholder="EX: PRJ-AB12" />
                </div>
                <div className="flex justify-end gap-2 mt-2">
                  <button className="btn btn-outline" onClick={() => { setShowJoin(false); setJoinFeedback(null); }}>Annuler</button>
                  <button className="btn" disabled={joinLoading} onClick={joinProject}>{joinLoading ? 'Rejoindre...' : 'Rejoindre'}</button>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
        {error && <div className="text-red-600 mb-4">{error}</div>}
        {loading && <div className="text-slate-500">Chargement...</div>}

        <div className="grid md:grid-cols-3 gap-6">
          {projects.map(p => {
            const isOwner = p.client && p.client.ownerId === user?.id;
            return (
              <Card key={p.id} className="cursor-pointer project-card hover:shadow-xl transition-all duration-200 border border-slate-200 hover:border-blue-400" onClick={() => selectProject(p)}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Squares2X2Icon className="w-6 h-6 text-blue-500" />
                    <h2 className="font-semibold text-lg">{p.name}</h2>
                  </div>
                  {p.projectCode && <span className="text-xs bg-blue-50 px-2 py-1 rounded font-mono text-blue-700 border border-blue-200">{p.projectCode}</span>}
                </div>
                <p className="text-sm text-slate-700 mb-2 line-clamp-3">{p.description || 'Aucune description'}</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="text-xs text-slate-500">Sprints: {p.sprints?.length || 0}</div>
                  <div className="flex gap-2">
                    <Button className="btn-xs btn-primary" onClick={e => { e.stopPropagation(); selectProject(p); }}>Accéder</Button>
                    {isOwner ? (
                      <Button className="btn-xs btn-danger" onClick={e => deleteProject(p.id, e)}>Supprimer</Button>
                    ) : (
                      <Button className="btn-xs btn-outline" onClick={e => leaveProject(p.id, e)}>Quitter</Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
          {!loading && projects.length === 0 && (
            <Card className="text-center py-8">
              <p className="mb-4">Aucun projet. Créez votre premier !</p>
              <Button onClick={() => setShowCreate(true)}>Créer un projet</Button>
            </Card>
          )}
        </div>

        {showCreate && (
          <div className="modal-root" role="dialog" aria-modal="true">
            <div className="modal-backdrop" onClick={() => setShowCreate(false)} />
            <div className="modal-card max-w-md">
              <div className="modal-header">
                <h3>Nouveau Projet</h3>
                <button className="btn btn-outline" onClick={() => setShowCreate(false)}>Fermer</button>
              </div>
              <div className="modal-body space-y-3">
                {feedback && <div className="text-sm text-slate-700">{feedback}</div>}
                <div>
                  <label className="block text-sm">Nom</label>
                  <input className="form-input" value={createForm.name} onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm">Description</label>
                  <textarea className="form-input" rows={4} value={createForm.description} onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))} />
                </div>
                <div className="flex justify-end gap-2 mt-2">
                  <button className="btn btn-outline" onClick={() => setShowCreate(false)}>Annuler</button>
                  <button className="btn" disabled={creating} onClick={createProject}>{creating ? 'Création...' : 'Créer'}</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
