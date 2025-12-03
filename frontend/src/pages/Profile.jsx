import React, { useEffect, useMemo, useState } from 'react'
import API from '../services/api'
import './Profile.css'

function initials(fullName = '') {
	const parts = String(fullName).trim().split(/\s+/)
	return parts.slice(0, 2).map(p => p[0]).join('').toUpperCase() || '?'
}

export default function Profile() {
	const [user, setUser] = useState(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [activeTab, setActiveTab] = useState('profile') // 'profile' | 'security'

	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [saving, setSaving] = useState(false)
	const [saveMsg, setSaveMsg] = useState('')

	const [currentPassword, setCurrentPassword] = useState('')
	const [newPassword, setNewPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [changingPwd, setChangingPwd] = useState(false)
	const [pwdMsg, setPwdMsg] = useState('')

	const [stats, setStats] = useState(null)

	useEffect(() => {
		let mounted = true
		async function fetchAll() {
			setLoading(true)
			setError('')
			try {
				const [meRes, statsRes] = await Promise.all([
					API.get('/api/auth/me'),
					API.get('/api/auth/stats').catch(() => ({ data: null })),
				])
				if (!mounted) return
				setUser(meRes.data)
				setName(meRes.data?.name || '')
				setEmail(meRes.data?.email || '')
				setStats(statsRes?.data || null)
			} catch (e) {
				if (!mounted) return
				setError(e?.response?.data?.message || 'Impossible de charger le profil')
			} finally {
				if (mounted) setLoading(false)
			}
		}
		fetchAll()
		return () => {
			mounted = false
		}
	}, [])

	async function onSaveProfile(e) {
		e.preventDefault()
		setSaveMsg('')
		setError('')
		setSaving(true)
		try {
			const { data } = await API.patch('/api/auth/profile', { name, email })
			setUser(prev => ({ ...prev, ...data }))
			setSaveMsg('Profil mis à jour avec succès')
		} catch (e) {
			setError(e?.response?.data?.message || 'Erreur lors de la mise à jour du profil')
		} finally {
			setSaving(false)
		}
	}

	async function onChangePassword(e) {
		e.preventDefault()
		setPwdMsg('')
		setError('')
		if (newPassword !== confirmPassword) {
			setError('La confirmation du mot de passe ne correspond pas')
			return
		}
		setChangingPwd(true)
		try {
			await API.patch('/api/auth/password', { currentPassword, newPassword })
			setPwdMsg('Mot de passe modifié avec succès')
			setCurrentPassword('')
			setNewPassword('')
			setConfirmPassword('')
		} catch (e) {
			setError(e?.response?.data?.message || 'Erreur lors du changement de mot de passe')
		} finally {
			setChangingPwd(false)
		}
	}

	const statusEntries = useMemo(() => {
		if (!stats?.issuesByStatus) return []
		return Object.entries(stats.issuesByStatus)
	}, [stats])

	return (
		<div className="profile-container">
			{/* Header Card */}
			<div className="header-card">
				<div className="header-main">
					<div className="header-id">
						<div className="avatar-circle">{initials(user?.name)}</div>
						<div>
							<h1 className="title-xxl">{user?.name || 'Profil'}</h1>
							<p className="text-dim">{user?.email || '—'}</p>
						</div>
					</div>
					{stats && (
						<div className="stats">
							<div className="stat">
								<div className="stat-label">Tickets</div>
								<div className="stat-value">{stats.totalIssues}</div>
							</div>
							{statusEntries.slice(0, 2).map(([k, v]) => (
								<div key={k} className="stat">
									<div className="stat-label">{k}</div>
									<div className="stat-value">{v}</div>
								</div>
							))}
						</div>
					)}
				</div>

				{/* Tabs */}
				<div className="tabs">
					{['profile', 'security'].map(tab => (
						<button
							key={tab}
							onClick={() => setActiveTab(tab)}
							className={[ 'tab', activeTab === tab ? 'is-active' : '' ].join(' ')}
						>
							{tab === 'profile' ? 'Profil' : 'Sécurité'}
						</button>
					))}
				</div>
			</div>

			{/* Alerts */}
			{!loading && error && (
				<div className="alert error">{error}</div>
			)}
			{saveMsg && activeTab === 'profile' && (
				<div className="alert success">{saveMsg}</div>
			)}
			{pwdMsg && activeTab === 'security' && (
				<div className="alert success">{pwdMsg}</div>
			)}

			{/* Content */}
			<div className="content">
				{loading && (
					<div className="skeleton-grid">
						<div className="skeleton" />
						<div className="skeleton" />
					</div>
				)}

				{!loading && user && activeTab === 'profile' && (
					<div className="card">
						<h2 className="title-lg">Informations du compte</h2>
						<p className="text-sm text-dim">Mettez à jour votre nom et votre adresse e‑mail.</p>
						<form onSubmit={onSaveProfile} className="form-grid">
							<div className="form-group">
								<label className="label">Nom</label>
								<input
									type="text"
									className="input"
									value={name}
									onChange={e => setName(e.target.value)}
									placeholder="Votre nom complet"
									required
								/>
							</div>
							<div className="form-group">
								<label className="label">Email</label>
								<input
									type="email"
									className="input"
									value={email}
									onChange={e => setEmail(e.target.value)}
									placeholder="votre@email.com"
									required
								/>
							</div>
							<div className="form-actions">
								<button type="submit" disabled={saving} className="btn btn-primary">
									{saving ? 'Enregistrement…' : 'Enregistrer'}
								</button>
							</div>
						</form>
					</div>
				)}

				{!loading && user && activeTab === 'security' && (
					<div className="card">
						<h2 className="title-lg">Sécurité</h2>
						<p className="text-sm text-dim">Changez votre mot de passe. Utilisez au moins 6 caractères.</p>
						<form onSubmit={onChangePassword} className="form-grid">
							<div className="form-group full">
								<label className="label">Mot de passe actuel</label>
								<input
									type="password"
									className="input"
									value={currentPassword}
									onChange={e => setCurrentPassword(e.target.value)}
									placeholder="••••••••"
									required
								/>
							</div>
							<div className="form-group">
								<label className="label">Nouveau mot de passe</label>
								<input
									type="password"
									className="input"
									value={newPassword}
									onChange={e => setNewPassword(e.target.value)}
									placeholder="Au moins 6 caractères"
									required
								/>
							</div>
							<div className="form-group">
								<label className="label">Confirmer le nouveau mot de passe</label>
								<input
									type="password"
									className="input"
									value={confirmPassword}
									onChange={e => setConfirmPassword(e.target.value)}
									placeholder="Répétez le mot de passe"
									required
								/>
							</div>
							<div className="form-actions">
								<button type="submit" disabled={changingPwd} className="btn btn-dark">
									{changingPwd ? 'Modification…' : 'Mettre à jour'}
								</button>
							</div>
						</form>
					</div>
				)}
			</div>
		</div>
	)
}
