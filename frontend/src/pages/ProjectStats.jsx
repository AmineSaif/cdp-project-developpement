import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useProject } from '../context/ProjectContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ResponsiveContainer,
} from 'recharts';

const ProjectStats = () => {
  const { project } = useProject();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!project) {
      navigate('/projects');
      return;
    }
    fetchStats();
  }, [project]);

  const fetchStats = async () => {
    if (!project) return;
    
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:4000/api/projects/${project.id}/stats`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setStats(response.data);
    } catch (err) {
      console.error('Erreur lors de la récupération des statistiques:', err);
      setError(
        err.response?.data?.message ||
          'Impossible de charger les statistiques'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="stats-loading">Chargement des statistiques...</div>;
  }

  if (error) {
    return <div className="stats-error">{error}</div>;
  }

  if (!stats) {
    return null;
  }

  // Couleurs pour les graphiques
  const STATUS_COLORS = {
    todo: '#94a3b8',
    in_progress: '#3b82f6',
    review: '#f59e0b',
    done: '#10b981',
  };

  const PRIORITY_COLORS = {
    low: '#94a3b8',
    medium: '#3b82f6',
    high: '#f59e0b',
    critical: '#ef4444',
  };

  // Formater les données pour les graphiques
  const statusData = stats.issuesByStatus.map((item) => ({
    name:
      item.status === 'todo'
        ? 'À faire'
        : item.status === 'in_progress'
        ? 'En cours'
        : item.status === 'review'
        ? 'En révision'
        : 'Terminé',
    value: item.count,
    color: STATUS_COLORS[item.status],
  }));

  const priorityData = stats.issuesByPriority.map((item) => ({
    name:
      item.priority === 'low'
        ? 'Basse'
        : item.priority === 'medium'
        ? 'Moyenne'
        : item.priority === 'high'
        ? 'Haute'
        : 'Critique',
    value: item.count,
    color: PRIORITY_COLORS[item.priority],
  }));

  const weeklyData = stats.weeklyProgress.map((item) => ({
    name: `Semaine ${item.week}`,
    complétées: item.completed,
  }));

  const burndownData = stats.burndown.map((item, index) => ({
    jour: `J${index + 1}`,
    restant: item.remaining,
    idéal: item.ideal,
  }));

  return (
    <div className="project-stats-page">
      <h1 className="stats-title">Statistiques du Projet</h1>

      <div className="flex justify-end mb-4">
        <button className="btn btn-primary" onClick={generateProjectPdf} disabled={generating}>
          {generating ? 'Génération...' : '📄 Rapport PDF global du projet'}
        </button>
      </div>

      {/* Cartes de vue d'ensemble */}
      <div className="stats-overview">
        <div className="stats-card">
          <div className="stats-card-icon">📊</div>
          <div className="stats-card-content">
            <div className="stats-card-label">Total Issues</div>
            <div className="stats-card-value">{stats.overview.totalIssues}</div>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-card-icon">✅</div>
          <div className="stats-card-content">
            <div className="stats-card-label">Terminées</div>
            <div className="stats-card-value">
              {stats.overview.completedIssues}
            </div>
            <div className="stats-card-subtitle">
              {stats.health.completionRate}% complété
            </div>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-card-icon">👥</div>
          <div className="stats-card-content">
            <div className="stats-card-label">Membres</div>
            <div className="stats-card-value">{stats.overview.totalMembers}</div>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-card-icon">🏃</div>
          <div className="stats-card-content">
            <div className="stats-card-label">Sprints</div>
            <div className="stats-card-value">{stats.overview.totalSprints}</div>
            <div className="stats-card-subtitle">
              {stats.overview.activeSprints} actif(s)
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques principaux */}
      <div className="stats-charts-grid">
        {/* Répartition par statut */}
        <div className="stats-chart-card">
          <h3 className="stats-chart-title">Répartition par Statut</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Répartition par priorité */}
        <div className="stats-chart-card">
          <h3 className="stats-chart-title">Répartition par Priorité</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={priorityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6">
                {priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Progression hebdomadaire */}
        <div className="stats-chart-card">
          <h3 className="stats-chart-title">Progression Hebdomadaire (4 Semaines)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="complétées"
                stroke="#10b981"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Burndown chart */}
        {stats.burndown.length > 0 && (
          <div className="stats-chart-card">
            <h3 className="stats-chart-title">Burndown du Sprint Actif</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={burndownData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="jour" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="idéal"
                  stroke="#94a3b8"
                  fill="#cbd5e1"
                  strokeDasharray="5 5"
                />
                <Area
                  type="monotone"
                  dataKey="restant"
                  stroke="#3b82f6"
                  fill="#93c5fd"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Métriques de sprints */}
      {stats.sprints.length > 0 && (
        <div className="stats-section">
          <h2 className="stats-section-title">Sprints</h2>
          <div className="stats-sprints-grid">
            {stats.sprints.map((sprint) => (
              <div key={sprint.id} className="stats-sprint-card">
                <div className="stats-sprint-header">
                  <h4 className="stats-sprint-name">{sprint.name}</h4>
                  <span
                    className={`stats-sprint-status ${
                      sprint.status === 'active'
                        ? 'active'
                        : sprint.status === 'completed'
                        ? 'completed'
                        : 'planned'
                    }`}
                  >
                    {sprint.status === 'active'
                      ? 'Actif'
                      : sprint.status === 'completed'
                      ? 'Terminé'
                      : 'Planifié'}
                  </span>
                </div>
                <div className="stats-sprint-details">
                  <div className="stats-sprint-metric">
                    <span className="stats-sprint-metric-label">Issues:</span>
                    <span className="stats-sprint-metric-value">
                      {sprint.totalIssues}
                    </span>
                  </div>
                  <div className="stats-sprint-metric">
                    <span className="stats-sprint-metric-label">Complétées:</span>
                    <span className="stats-sprint-metric-value">
                      {sprint.completedIssues}
                    </span>
                  </div>
                  <div className="stats-sprint-progress">
                    <div className="stats-sprint-progress-bar">
                      <div
                        className="stats-sprint-progress-fill"
                        style={{ width: `${sprint.completionRate}%` }}
                      ></div>
                    </div>
                    <span className="stats-sprint-progress-text">
                      {sprint.completionRate}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Indicateurs de santé */}
      <div className="stats-section">
        <h2 className="stats-section-title">Santé du Projet</h2>
        <div className="stats-health-grid">
          <div className="stats-health-card">
            <div className="stats-health-icon">⚠️</div>
            <div className="stats-health-content">
              <div className="stats-health-label">Issues Non Assignées</div>
              <div className="stats-health-value">
                {stats.health.unassignedIssues}
              </div>
            </div>
          </div>

          <div className="stats-health-card">
            <div className="stats-health-icon">🚫</div>
            <div className="stats-health-content">
              <div className="stats-health-label">Issues Bloquées</div>
              <div className="stats-health-value">
                {stats.health.blockedIssues}
              </div>
            </div>
          </div>

          <div className="stats-health-card">
            <div className="stats-health-icon">📈</div>
            <div className="stats-health-content">
              <div className="stats-health-label">Activité Récente</div>
              <div className="stats-health-value">
                {stats.overview.recentActivity}
              </div>
              <div className="stats-health-subtitle">7 derniers jours</div>
            </div>
          </div>

          <div className="stats-health-card">
            <div className="stats-health-icon">🎯</div>
            <div className="stats-health-content">
              <div className="stats-health-label">Taux de Complétion</div>
              <div className="stats-health-value">
                {stats.health.completionRate}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  // Helpers
  function fmtDate(d) {
    if (!d) return '-';
    try { return new Date(d).toLocaleDateString(); } catch { return '-'; }
  }

  function slug(str) {
    return String(str || '')
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-]/g, '');
  }

  async function generateProjectPdf() {
    if (!project) return;
    try {
      setGenerating(true);
      const token = localStorage.getItem('token');

      // Utiliser le projet du contexte et charger toutes les données nécessaires
      const statsRes = await axios.get(`http://localhost:4000/api/projects/${project.id}/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const s = statsRes.data || {};

      const sprintsRes = await axios.get(`http://localhost:4000/api/projects/${project.id}/sprints`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sprints = sprintsRes.data || [];

      const projectRes = await axios.get(`http://localhost:4000/api/projects/${project.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const proj = (projectRes.data && projectRes.data.project) ? projectRes.data.project : project;

      const membersRes = await axios.get(`http://localhost:4000/api/projects/${project.id}/members`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const members = (membersRes.data && membersRes.data.members) ? membersRes.data.members : [];

      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      doc.setFontSize(16);
      doc.text(`Rapport global du projet: ${proj.name}`, 40, 40);
      doc.setFontSize(11);
      doc.text(`Client: ${proj.client?.name || '-'}`, 40, 60);
      doc.text(`Code projet: ${proj.projectCode || '-'}`, 40, 75);
      doc.text(`Créé par: ${proj.creator?.name || '-'}`, 40, 90);
      doc.text(`Verrou inscriptions: ${proj.joinLocked ? 'Oui' : 'Non'}`, 300, 60);
      doc.text(`Créé le: ${fmtDate(proj.createdAt)}`, 300, 75);
      doc.text(`Mis à jour le: ${fmtDate(proj.updatedAt)}`, 300, 90);

      autoTable(doc, {
        startY: 110,
        head: [['Métrique', 'Valeur']],
        body: [
          ['Issues totales', s.overview?.totalIssues ?? s.totalIssues ?? 0],
          ['Terminées', s.overview?.completedIssues ?? s.issuesByStatus?.done ?? 0],
          ['En cours', s.issuesByStatus?.inprogress ?? 0],
          ['En révision', s.issuesByStatus?.inreview ?? 0],
          ['Membres', s.overview?.totalMembers ?? members.length ?? '-'],
          ['Sprints', s.overview?.totalSprints ?? sprints.length ?? '-'],
          ['Taux de complétion', `${s.health?.completionRate ?? '-'}%`],
          ['Bugs', s.issuesByType?.bug ?? 0],
          ['Features', s.issuesByType?.feature ?? 0],
          ['Tasks', s.issuesByType?.task ?? 0],
        ],
        styles: { fontSize: 10 },
      });

      if (Array.isArray(s.issuesByStatus)) {
        autoTable(doc, {
          margin: { top: 20 },
          head: [['Statut', 'Nombre']],
          body: s.issuesByStatus.map(item => [item.status, item.count]),
          styles: { fontSize: 9 },
        });
      }

      if (Array.isArray(s.issuesByPriority)) {
        autoTable(doc, {
          margin: { top: 20 },
          head: [['Priorité', 'Nombre']],
          body: s.issuesByPriority.map(item => [item.priority, item.count]),
          styles: { fontSize: 9 },
        });
      }

      if (s.health) {
        autoTable(doc, {
          margin: { top: 20 },
          head: [['Indicateur', 'Valeur']],
          body: [
            ['Issues non assignées', s.health.unassignedIssues ?? '-'],
            ['Issues bloquées', s.health.blockedIssues ?? '-'],
            ['Activité récente (7j)', s.overview?.recentActivity ?? '-'],
            ['Taux de complétion', `${s.health.completionRate ?? '-'}%`],
          ],
          styles: { fontSize: 9 },
        });
      }

      autoTable(doc, {
        margin: { top: 30 },
        head: [['Sprint', 'Début', 'Fin', 'Terminées', 'En cours']],
        body: sprints.map(sp => [
          sp.name || sp.title || sp.id,
          fmtDate(sp.startDate),
          fmtDate(sp.endDate),
          sp.stats?.done ?? sp.completedIssues ?? 0,
          sp.stats?.inprogress ?? (sp.totalIssues - (sp.completedIssues || 0)) ?? 0,
        ]),
        styles: { fontSize: 9 },
      });

      if (members.length) {
        autoTable(doc, {
          margin: { top: 30 },
          head: [['Nom', 'Email', 'Rôle', 'Date de jointure']],
          body: members.map(m => [
            m.name || '-',
            m.email || '-',
            m.role || '-',
            fmtDate(m.joinedAt)
          ]),
          styles: { fontSize: 9 },
          columnStyles: { 0: { cellWidth: 160 }, 1: { cellWidth: 180 } }
        });
      }

      if (Array.isArray(s.weeklyProgress) && s.weeklyProgress.length) {
        autoTable(doc, {
          margin: { top: 30 },
          head: [['Semaine', 'Issues complétées']],
          body: s.weeklyProgress.map(w => [`Semaine ${w.week}`, w.completed]),
          styles: { fontSize: 9 },
        });
      }

      doc.save(`rapport-projet-${slug(project.name)}.pdf`);
    } catch (err) {
      console.error('Erreur génération PDF projet:', err);
      alert('Impossible de générer le PDF global du projet.');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="project-stats-page">
      <h1 className="stats-title">Statistiques du Projet</h1>

      <div className="flex justify-end mb-4">
        <button className="btn btn-primary" onClick={generateProjectPdf} disabled={generating}>
          {generating ? 'Génération...' : '📄 Rapport PDF global du projet'}
        </button>
      </div>

      {/* Cartes de vue d'ensemble */}
      <div className="stats-overview">
        <div className="stats-card">
          <div className="stats-card-icon">📊</div>
          <div className="stats-card-content">
            <div className="stats-card-label">Total Issues</div>
            <div className="stats-card-value">{stats.overview.totalIssues}</div>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-card-icon">✅</div>
          <div className="stats-card-content">
            <div className="stats-card-label">Terminées</div>
            <div className="stats-card-value">
              {stats.overview.completedIssues}
            </div>
            <div className="stats-card-subtitle">
              {stats.health.completionRate}% complété
            </div>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-card-icon">👥</div>
          <div className="stats-card-content">
            <div className="stats-card-label">Membres</div>
            <div className="stats-card-value">{stats.overview.totalMembers}</div>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-card-icon">🏃</div>
          <div className="stats-card-content">
            <div className="stats-card-label">Sprints</div>
            <div className="stats-card-value">{stats.overview.totalSprints}</div>
            <div className="stats-card-subtitle">
              {stats.overview.activeSprints} actif(s)
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques principaux */}
      <div className="stats-charts-grid">
        {/* Répartition par statut */}
        <div className="stats-chart-card">
          <h3 className="stats-chart-title">Répartition par Statut</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Répartition par priorité */}
        <div className="stats-chart-card">
          <h3 className="stats-chart-title">Répartition par Priorité</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={priorityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6">
                {priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Progression hebdomadaire */}
        <div className="stats-chart-card">
          <h3 className="stats-chart-title">Progression Hebdomadaire (4 Semaines)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="complétées"
                stroke="#10b981"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Burndown chart */}
        {stats.burndown.length > 0 && (
          <div className="stats-chart-card">
            <h3 className="stats-chart-title">Burndown du Sprint Actif</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={burndownData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="jour" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="idéal"
                  stroke="#94a3b8"
                  fill="#cbd5e1"
                  strokeDasharray="5 5"
                />
                <Area
                  type="monotone"
                  dataKey="restant"
                  stroke="#3b82f6"
                  fill="#93c5fd"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Métriques de sprints */}
      {stats.sprints.length > 0 && (
        <div className="stats-section">
          <h2 className="stats-section-title">Sprints</h2>
          <div className="stats-sprints-grid">
            {stats.sprints.map((sprint) => (
              <div key={sprint.id} className="stats-sprint-card">
                <div className="stats-sprint-header">
                  <h4 className="stats-sprint-name">{sprint.name}</h4>
                  <span
                    className={`stats-sprint-status ${
                      sprint.status === 'active'
                        ? 'active'
                        : sprint.status === 'completed'
                        ? 'completed'
                        : 'planned'
                    }`}
                  >
                    {sprint.status === 'active'
                      ? 'Actif'
                      : sprint.status === 'completed'
                      ? 'Terminé'
                      : 'Planifié'}
                  </span>
                </div>
                <div className="stats-sprint-details">
                  <div className="stats-sprint-metric">
                    <span className="stats-sprint-metric-label">Issues:</span>
                    <span className="stats-sprint-metric-value">
                      {sprint.totalIssues}
                    </span>
                  </div>
                  <div className="stats-sprint-metric">
                    <span className="stats-sprint-metric-label">Complétées:</span>
                    <span className="stats-sprint-metric-value">
                      {sprint.completedIssues}
                    </span>
                  </div>
                  <div className="stats-sprint-progress">
                    <div className="stats-sprint-progress-bar">
                      <div
                        className="stats-sprint-progress-fill"
                        style={{ width: `${sprint.completionRate}%` }}
                      ></div>
                    </div>
                    <span className="stats-sprint-progress-text">
                      {sprint.completionRate}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Indicateurs de santé */}
      <div className="stats-section">
        <h2 className="stats-section-title">Santé du Projet</h2>
        <div className="stats-health-grid">
          <div className="stats-health-card">
            <div className="stats-health-icon">⚠️</div>
            <div className="stats-health-content">
              <div className="stats-health-label">Issues Non Assignées</div>
              <div className="stats-health-value">
                {stats.health.unassignedIssues}
              </div>
            </div>
          </div>

          <div className="stats-health-card">
            <div className="stats-health-icon">🚫</div>
            <div className="stats-health-content">
              <div className="stats-health-label">Issues Bloquées</div>
              <div className="stats-health-value">
                {stats.health.blockedIssues}
              </div>
            </div>
          </div>

          <div className="stats-health-card">
            <div className="stats-health-icon">📈</div>
            <div className="stats-health-content">
              <div className="stats-health-label">Activité Récente</div>
              <div className="stats-health-value">
                {stats.overview.recentActivity}
              </div>
              <div className="stats-health-subtitle">7 derniers jours</div>
            </div>
          </div>

          <div className="stats-health-card">
            <div className="stats-health-icon">🎯</div>
            <div className="stats-health-content">
              <div className="stats-health-label">Taux de Complétion</div>
              <div className="stats-health-value">
                {stats.health.completionRate}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectStats;
