const Issue = require('../models/issue');
const User = require('../models/user');

async function createIssue(req, res) {
  const { title, description, type, priority, assigneeId } = req.body || {};
  if (!title) return res.status(400).json({ message: 'title is required' });
  
  try {
    console.log('=== CREATE ISSUE CALLED ===');
    console.log('User ID:', req.user.id);
    
    // Récupérer le teamId de l'utilisateur connecté
    const user = await User.findByPk(req.user.id, { attributes: ['teamId'] });
    console.log('User teamId:', user?.teamId);
    
    // Let Sequelize use the model defaults - don't override them
    const issue = await Issue.create({
      title,
      description: description || '',
      type, // will default to 'task' if not provided
      priority, // will default to 'low' if not provided  
      // status will default to 'todo' automatically
      assigneeId: assigneeId || null,
      createdById: req.user.id,
      teamId: user.teamId || null // Associer à l'équipe de l'utilisateur
    });
    
    console.log('Issue created with ID:', issue.id, 'teamId:', issue.teamId);
    return res.status(201).json(issue);
  } catch (err) {
    console.error('Error creating issue:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function listIssues(req, res) {
  try {
    console.log('=== LIST ISSUES CALLED ===');
    const { myIssuesOnly } = req.query;
    const userId = req.user ? req.user.id : null;
    console.log('User ID:', userId, 'myIssuesOnly:', myIssuesOnly);
    
    if (!userId) {
      console.log('No user ID - returning 401');
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Récupérer l'équipe de l'utilisateur
    const user = await User.findByPk(userId, { attributes: ['teamId'] });
    console.log('User found:', user ? 'YES' : 'NO', 'teamId:', user?.teamId);
    
    if (!user) {
      console.log('User not found - returning 404');
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!user.teamId) {
      console.log('User has no team - returning empty array');
      // Si l'utilisateur n'a pas d'équipe, retourner un tableau vide (board vide)
      return res.json([]);
    }
    
    let whereConditions = {
      teamId: user.teamId // TOUJOURS filtrer par équipe
    };
    
    // Si myIssuesOnly activé, ajouter le filtre sur assigneeId
    if (myIssuesOnly === 'true') {
      whereConditions.assigneeId = userId;
    }
    
    console.log('WHERE conditions:', whereConditions);
    
    const issues = await Issue.findAll({
      where: whereConditions,
      order: [['createdAt', 'DESC']],
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name'] },
        { model: User, as: 'creator', attributes: ['id', 'name'] }
      ]
    });
    
    console.log('Found', issues.length, 'issues');
    return res.json(issues);
  } catch (err) {
    console.error('ERROR in listIssues:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function getIssue(req, res) {
  try {
    const id = Number(req.params.id);
    const userId = req.user.id;
    
    // Récupérer l'équipe de l'utilisateur
    const user = await User.findByPk(userId, { attributes: ['teamId'] });
    if (!user || !user.teamId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const issue = await Issue.findOne({
      where: {
        id,
        teamId: user.teamId // Vérifier que l'issue appartient à l'équipe
      }
    });
    
    if (!issue) return res.status(404).json({ message: 'Issue not found' });
    return res.json(issue);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function updateIssue(req, res) {
  try {
    const id = Number(req.params.id);
    const userId = req.user.id;
    
    // Récupérer l'équipe de l'utilisateur
    const user = await User.findByPk(userId, { attributes: ['teamId'] });
    if (!user || !user.teamId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const issue = await Issue.findOne({
      where: {
        id,
        teamId: user.teamId // Vérifier que l'issue appartient à l'équipe
      }
    });
    
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    // only allow certain fields to be updated
    const { title, description, type, priority, status, assigneeId } = req.body || {};
    if (title !== undefined) issue.title = title;
    if (description !== undefined) issue.description = description;
    if (type !== undefined) issue.type = type;
    if (priority !== undefined) issue.priority = priority;
    if (status !== undefined) issue.status = status;
    if (assigneeId !== undefined) issue.assigneeId = assigneeId;

    await issue.save();
    return res.json(issue);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function deleteIssue(req, res) {
  try {
    console.log('DELETE ISSUE CALLED - ID:', req.params.id);
    const id = Number(req.params.id);
    const userId = req.user.id;
    console.log('Looking for issue with ID:', id);
    
    // Récupérer l'équipe de l'utilisateur
    const user = await User.findByPk(userId, { attributes: ['teamId'] });
    if (!user || !user.teamId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const issue = await Issue.findOne({
      where: {
        id,
        teamId: user.teamId // Vérifier que l'issue appartient à l'équipe
      }
    });
    console.log('Found issue:', issue ? 'YES' : 'NO');
    
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    console.log('Destroying issue...');
    await issue.destroy();
    console.log('Issue deleted successfully');
    
    return res.json({ message: 'Issue deleted successfully' });
  } catch (err) {
    console.error('Error deleting issue:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { createIssue, listIssues, getIssue, updateIssue, deleteIssue };
