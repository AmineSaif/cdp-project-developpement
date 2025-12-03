const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/user');
const Team = require('../models/team'); // legacy
const { Client, Project, Sprint, ProjectMember } = require('../models');
const { generateUniqueProjectCode } = require('../utils/projectCodeGenerator');

const jwtSecret = process.env.JWT_SECRET || 'changeme';

async function register(req, res) {
  // Nouveau flux: projectCode optionnel. Si absent => création Client + Project + Sprint init.
  const { name, email, password, role, projectCode } = req.body || {};
  if (!name || !email || !password) return res.status(400).json({ message: 'name, email and password required' });
  try {
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ message: 'Email already used' });
    const passwordHash = await bcrypt.hash(password, 10);

    // Créer l'utilisateur (sans team par défaut, l'équipe peut venir du projet)
    const user = await User.create({ name, email, passwordHash, role });

    let createdEntities = {}; // Pour renvoyer au frontend

    if (projectCode) {
      // Rejoindre un projet existant via projectCode
      const project = await Project.findOne({
        where: { projectCode: projectCode.toLowerCase() },
        include: [
          { model: Client, as: 'client' }
        ]
      });
      if (!project) {
        return res.status(404).json({ message: 'Code projet invalide' });
      }
      // Hériter de son éventuelle équipe
      if (project.teamId) {
        await user.update({ teamId: project.teamId });
      }
      // Ajouter l'utilisateur comme membre du projet
      await ProjectMember.create({
        projectId: project.id,
        userId: user.id,
        role: 'member'
      });
      createdEntities.joinedProjectId = project.id;
    } else {
      // Création d'un nouveau client + projet + sprint initial
      const client = await Client.create({ name: `Client de ${name}`, ownerId: user.id });
      const newProjectCode = await generateUniqueProjectCode();
      const project = await Project.create({
        name: `Projet principal de ${name}`,
        description: 'Projet initial créé à l\'inscription',
        projectCode: newProjectCode,
        clientId: client.id,
        teamId: null,
        createdById: user.id
      });
      const sprint = await Sprint.create({
        name: 'Sprint 1',
        projectId: project.id,
        status: 'planned',
        createdById: user.id
      });
      createdEntities.clientId = client.id;
      createdEntities.projectId = project.id;
      createdEntities.projectCode = newProjectCode;
      createdEntities.initialSprintId = sprint.id;
    }

    const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, jwtSecret, { expiresIn: '7d' });
    return res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        teamId: user.teamId || null,
        ...createdEntities
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function login(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: 'email and password required' });
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    if (!user.passwordHash || typeof user.passwordHash !== 'string') {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, jwtSecret, { expiresIn: '7d' });
    return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function me(req, res) {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ message: 'Not authenticated' });
    const user = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'role', 'teamId'],
      include: [
        { model: Team, as: 'team', attributes: ['id', 'name', 'teamCode'] },
        { model: Project, as: 'createdProjects', attributes: ['id', 'name', 'projectCode', 'clientId'] },
        { model: Sprint, as: 'createdSprints', attributes: ['id', 'name', 'projectId', 'status'] },
        { model: Client, as: 'ownedClients', attributes: ['id', 'name'] }
      ]
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function updateProfile(req, res) {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ message: 'Not authenticated' });

    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    // Check if email is already used by another user
    const existingUser = await User.findOne({ 
      where: { 
        email,
        id: { [require('sequelize').Op.ne]: userId }
      } 
    });
    
    if (existingUser) {
      return res.status(409).json({ message: 'Email already used by another user' });
    }

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await user.update({ name, email });
    
    return res.json({ 
      id: user.id, 
      name: user.name, 
      email: user.email, 
      role: user.role 
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function changePassword(req, res) {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ message: 'Not authenticated' });

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Verify current password
    if (!user.passwordHash || typeof user.passwordHash !== 'string') {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await user.update({ passwordHash: newPasswordHash });

    return res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function getUserStats(req, res) {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ message: 'Not authenticated' });
    const Issue = require('../models/issue');
    const { myIssuesOnly, sprintId, projectId } = req.query;

    // Base conditions
    const whereConditions = {};
    if (sprintId) whereConditions.sprintId = Number(sprintId);
    if (projectId && !sprintId) {
      // Filtrer par project via jointure Sprint -> Project
      // Fallback: récupérer tous les sprints du projet
      const sprints = await Sprint.findAll({ where: { projectId: Number(projectId) }, attributes: ['id'] });
      whereConditions.sprintId = sprints.map(s => s.id);
    }

    if (myIssuesOnly === 'true') {
      whereConditions.assigneeId = userId;
    }

    const allIssues = await Issue.findAll({ where: whereConditions, attributes: ['status', 'type'] });
    const issuesByStatus = {}; const issuesByType = {};
    allIssues.forEach(issue => {
      issuesByStatus[issue.status] = (issuesByStatus[issue.status] || 0) + 1;
      issuesByType[issue.type] = (issuesByType[issue.type] || 0) + 1;
    });
    return res.json({ totalIssues: allIssues.length, issuesByStatus, issuesByType });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { register, login, me, updateProfile, changePassword, getUserStats };
