import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import API from '../services/api'

export default function Profile() {
  const { user, setUser } = useAuth()
  const [activeTab, setActiveTab] = useState('info') // 'info', 'stats', 'password'
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    role: '',
    team: null
  })
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const response = await API.get('/api/auth/me')
      setProfile({
        name: response.data.name || '',
        email: response.data.email || '',
        role: response.data.role || '',
        team: response.data.team || null
      })
    } catch (err) {
      setError('Erreur lors du chargement du profil')
    } finally {
      setLoading(false)
    }
  }

  const handleProfileChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }))
    setError(null)
    setSuccess(null)
  }

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }))
    setError(null)
    setSuccess(null)
  }

  const saveProfile = async () => {
    if (!profile.name.trim() || !profile.email.trim()) {
      setError('Le nom et l\'email sont requis')
      return
    }

    setSaving(true)
    try {
      const response = await API.patch('/api/auth/profile', {
        name: profile.name,
        email: profile.email
      })
      
      // Mettre à jour le contexte utilisateur
      setUser(prev => ({ ...prev, name: response.data.name, email: response.data.email }))
      setSuccess('Profil mis à jour avec succès')
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const changePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setError('Tous les champs du mot de passe sont requis')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Les nouveaux mots de passe ne correspondent pas')
      return
    }

    if (passwordData.newPassword.length < 6) {
      setError('Le nouveau mot de passe doit contenir au moins 6 caractères')
      return
    }

    setChangingPassword(true)
    try {
      await API.patch('/api/auth/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })
      
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setSuccess('Mot de passe changé avec succès')
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du changement de mot de passe')
    } finally {
      setChangingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className="container">
        <div className="text-center py-8">
          <div className="animate-spin">⏳</div>
          <p className="mt-2">Chargement du profil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Mon Profil</h1>

        {error && (
          <div className="alert alert-error mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success mb-4">
            {success}
          </div>
        )}

        {/* Navigation par onglets */}
        <div className="profile-nav">
          <button 
            className={`profile-nav-tab ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            👤 Informations personnelles
          </button>
          <button 
            className={`profile-nav-tab ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            📊 Statistiques
          </button>
          <button 
            className={`profile-nav-tab ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            🔒 Mot de passe
          </button>
        </div>

        {/* Contenu des onglets */}
        <div className="profile-content">
          {activeTab === 'info' && (
            <div className="card">
              <div className="card-header">
                <h2 className="text-xl font-semibold">Informations personnelles</h2>
                <p className="text-sm text-gray-600">Gérez vos informations de profil</p>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nom complet</label>
                    <input 
                      type="text"
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={profile.name}
                      onChange={(e) => handleProfileChange('name', e.target.value)}
                      placeholder="Votre nom complet"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Adresse email</label>
                    <input 
                      type="email"
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={profile.email}
                      onChange={(e) => handleProfileChange('email', e.target.value)}
                      placeholder="votre@email.com"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium mb-2">Rôle</label>
                  <input 
                    type="text"
                    className="w-full p-3 border rounded-lg bg-gray-100"
                    value={profile.role}
                    disabled
                    placeholder="Rôle dans l'organisation"
                  />
                  <p className="text-sm text-gray-600 mt-1">Le rôle est défini par l'administrateur</p>
                </div>

                {/* Code d'équipe */}
                {profile.team && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="text-sm font-semibold mb-2">🎯 Code d'équipe</h3>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 px-3 py-2 bg-white border rounded font-mono text-lg tracking-wider">
                        {profile.team.teamCode}
                      </code>
                      <button
                        className="btn btn-outline"
                        onClick={() => {
                          navigator.clipboard.writeText(profile.team.teamCode)
                          setSuccess('Code copié dans le presse-papier !')
                          setTimeout(() => setSuccess(null), 2000)
                        }}
                      >
                        📋 Copier
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Partagez ce code avec vos collègues pour qu'ils rejoignent votre équipe lors de l'inscription.
                    </p>
                    <p className="text-sm text-gray-700 mt-1 font-medium">
                      Équipe : {profile.team.name}
                    </p>
                  </div>
                )}

                <div className="mt-8 flex justify-end">
                  <button 
                    className="btn btn-primary"
                    onClick={saveProfile}
                    disabled={saving}
                  >
                    {saving ? 'Sauvegarde...' : '💾 Sauvegarder les modifications'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="card">
              <div className="card-header">
                <h2 className="text-xl font-semibold">Mes statistiques</h2>
                <p className="text-sm text-gray-600">Aperçu de votre activité</p>
              </div>
              <div className="card-body">
                <UserStats />
              </div>
            </div>
          )}

          {activeTab === 'password' && (
            <div className="card">
              <div className="card-header">
                <h2 className="text-xl font-semibold">Changer le mot de passe</h2>
                <p className="text-sm text-gray-600">Assurez-vous d'utiliser un mot de passe sécurisé</p>
              </div>
              <div className="card-body">
                <div className="max-w-md space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Mot de passe actuel</label>
                    <input 
                      type="password"
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={passwordData.currentPassword}
                      onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                      placeholder="Votre mot de passe actuel"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Nouveau mot de passe</label>
                    <input 
                      type="password"
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={passwordData.newPassword}
                      onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                      placeholder="Nouveau mot de passe (min. 6 caractères)"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Confirmer le nouveau mot de passe</label>
                    <input 
                      type="password"
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={passwordData.confirmPassword}
                      onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                      placeholder="Répétez le nouveau mot de passe"
                    />
                  </div>
                </div>

                <div className="mt-8">
                  <button 
                    className="btn btn-secondary"
                    onClick={changePassword}
                    disabled={changingPassword}
                  >
                    {changingPassword ? 'Changement en cours...' : '🔒 Changer le mot de passe'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Composant pour les statistiques utilisateur
function UserStats() {
  const [stats, setStats] = useState({
    totalIssues: 0,
    issuesByStatus: {},
    issuesByType: {}
  })
  const [loading, setLoading] = useState(true)
  const [myIssuesOnly, setMyIssuesOnly] = useState(false)

  useEffect(() => {
    fetchUserStats()
  }, [myIssuesOnly])

  const fetchUserStats = async () => {
    try {
      const url = myIssuesOnly ? '/api/auth/stats?myIssuesOnly=true' : '/api/auth/stats'
      const response = await API.get(url)
      setStats(response.data)
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-4">Chargement des statistiques...</div>
  }

  return (
    <div className="space-y-6">
      {/* Toggle pour filtrer les stats */}
      <div className="flex justify-end">
        <button 
          className={`btn ${myIssuesOnly ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setMyIssuesOnly(!myIssuesOnly)}
        >
          {myIssuesOnly ? '✅ Mes issues assignées' : '👥 Issues de l\'équipe'}
        </button>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card stat-card-blue">
          <div className="stat-icon">📝</div>
          <div className="stat-number">{stats.totalIssues}</div>
          <div className="stat-label">Issues créées</div>
        </div>
        
        <div className="stat-card stat-card-green">
          <div className="stat-icon">✅</div>
          <div className="stat-number">{stats.issuesByStatus?.done || 0}</div>
          <div className="stat-label">Issues terminées</div>
        </div>
        
        <div className="stat-card stat-card-orange">
          <div className="stat-icon">⏳</div>
          <div className="stat-number">{stats.issuesByStatus?.inprogress || 0}</div>
          <div className="stat-label">En cours</div>
        </div>

        <div className="stat-card stat-card-purple">
          <div className="stat-icon">🔍</div>
          <div className="stat-number">{stats.issuesByStatus?.inreview || 0}</div>
          <div className="stat-label">En révision</div>
        </div>
      </div>

      {/* Répartition par type */}
      <div className="max-w-sm mx-auto">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 text-center">Répartition par type</h3>
        <div className="space-y-3">
          <div className="type-stat">
            <span className="type-icon">🐛</span>
            <span className="type-label">Bugs</span>
            <span className="type-count">{stats.issuesByType?.bug || 0}</span>
          </div>
          <div className="type-stat">
            <span className="type-icon">⭐</span>
            <span className="type-label">Features</span>
            <span className="type-count">{stats.issuesByType?.feature || 0}</span>
          </div>
          <div className="type-stat">
            <span class="type-icon">📋</span>
            <span className="type-label">Tasks</span>
            <span className="type-count">{stats.issuesByType?.task || 0}</span>
          </div>
        </div>
      </div>
    </div>
  )
}