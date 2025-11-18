import React, { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import API from '../services/api'

export default function Profile() {
  const { user, setUser } = useContext(AuthContext)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    role: ''
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
        role: response.data.role || ''
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
      <div className="max-w-2xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Mon Profil</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        {/* Section Informations personnelles */}
        <div className="card mb-8">
          <div className="card-header">
            <h2 className="text-xl font-semibold">Informations personnelles</h2>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nom</label>
                <input 
                  type="text"
                  className="w-full p-3 border rounded-lg"
                  value={profile.name}
                  onChange={(e) => handleProfileChange('name', e.target.value)}
                  placeholder="Votre nom complet"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input 
                  type="email"
                  className="w-full p-3 border rounded-lg"
                  value={profile.email}
                  onChange={(e) => handleProfileChange('email', e.target.value)}
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Rôle</label>
              <input 
                type="text"
                className="w-full p-3 border rounded-lg bg-gray-100"
                value={profile.role}
                disabled
                placeholder="Rôle dans l'organisation"
              />
              <p className="text-sm text-gray-600 mt-1">Le rôle ne peut pas être modifié</p>
            </div>

            <div className="mt-6">
              <button 
                className="btn btn-primary"
                onClick={saveProfile}
                disabled={saving}
              >
                {saving ? 'Sauvegarde...' : '💾 Sauvegarder le profil'}
              </button>
            </div>
          </div>
        </div>

        {/* Section Changer le mot de passe */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold">Changer le mot de passe</h2>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Mot de passe actuel</label>
                <input 
                  type="password"
                  className="w-full p-3 border rounded-lg"
                  value={passwordData.currentPassword}
                  onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                  placeholder="Votre mot de passe actuel"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Nouveau mot de passe</label>
                <input 
                  type="password"
                  className="w-full p-3 border rounded-lg"
                  value={passwordData.newPassword}
                  onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                  placeholder="Nouveau mot de passe (min. 6 caractères)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Confirmer le nouveau mot de passe</label>
                <input 
                  type="password"
                  className="w-full p-3 border rounded-lg"
                  value={passwordData.confirmPassword}
                  onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                  placeholder="Répétez le nouveau mot de passe"
                />
              </div>
            </div>

            <div className="mt-6">
              <button 
                className="btn btn-secondary"
                onClick={changePassword}
                disabled={changingPassword}
              >
                {changingPassword ? 'Changement...' : '🔒 Changer le mot de passe'}
              </button>
            </div>
          </div>
        </div>

        {/* Section Statistiques */}
        <div className="card mt-8">
          <div className="card-header">
            <h2 className="text-xl font-semibold">Mes statistiques</h2>
          </div>
          <div className="card-body">
            <UserStats />
          </div>
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

  useEffect(() => {
    fetchUserStats()
  }, [])

  const fetchUserStats = async () => {
    try {
      const response = await API.get('/api/auth/stats')
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="text-center p-4 bg-blue-50 rounded-lg">
        <div className="text-2xl font-bold text-blue-600">{stats.totalIssues}</div>
        <div className="text-sm text-gray-600">Issues créées</div>
      </div>
      
      <div className="text-center p-4 bg-green-50 rounded-lg">
        <div className="text-2xl font-bold text-green-600">{stats.issuesByStatus?.done || 0}</div>
        <div className="text-sm text-gray-600">Issues terminées</div>
      </div>
      
      <div className="text-center p-4 bg-orange-50 rounded-lg">
        <div className="text-2xl font-bold text-orange-600">{stats.issuesByStatus?.inprogress || 0}</div>
        <div className="text-sm text-gray-600">Issues en cours</div>
      </div>
    </div>
  )
}