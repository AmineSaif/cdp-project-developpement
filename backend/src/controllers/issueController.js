// Nouveau contrôleur d'issues basé sur la hiérarchie Client -> Project -> Sprint
const { Issue, Sprint, Project, Client, User, ProjectMember } = require('../models');
const { createNotification } = require('../utils/notificationHelper');

// Vérifie l'accès à un sprint (propriétaire du client OU membre du projet)
async function resolveSprintAccess(sprintId, userId) {
  const user = await User.findByPk(userId, { attributes: ['id'] });
  if (!user) return { allowed: false };

  const sprint = await Sprint.findOne({
    where: { id: sprintId },
    include: [
      {
        model: Project,
        as: 'project',
        include: [
          { model: Client, as: 'client', attributes: ['id', 'ownerId'] }
        ]
      }
    ]
  });

  if (!sprint) return { allowed: false };

  const isOwner = sprint.project.client.ownerId === userId;
  
  // Vérifier si l'utilisateur est membre du projet
  const membership = await ProjectMember.findOne({
    where: { projectId: sprint.project.id, userId }
  });
  const isMember = !!membership;

  return { allowed: (isOwner || isMember), sprint, user, project: sprint.project };
}

async function createIssue(req, res) {
  const { title, description, type, priority, assigneeId, sprintId } = req.body || {};
  if (!title) return res.status(400).json({ message: 'title is required' });
  if (!sprintId) return res.status(400).json({ message: 'sprintId is required' });

  try {
    console.log('=== CREATE ISSUE (sprint-based) ===');
    const { allowed, sprint, project } = await resolveSprintAccess(sprintId, req.user.id);
    if (!allowed) return res.status(403).json({ message: 'Access denied to sprint' });

    const issue = await Issue.create({
      title,
      description: description || '',
      type,
      priority,
      assigneeId: assigneeId || null,
      createdById: req.user.id,
      sprintId,
      teamId: null // Plus de gestion d'équipe pour les projets
    });
    console.log('Issue created ID:', issue.id, 'sprintId:', issue.sprintId);

    // Notification pour l'assignement
    if (assigneeId && assigneeId !== req.user.id) {
      const assignee = await User.findByPk(assigneeId);
      if (assignee) {
        await createNotification({
          type: 'issue_assigned',
          message: `${req.user.name} vous a assigné(e) l'issue "${title}"`,
          userId: assigneeId,
          relatedProjectId: project.id,
          relatedIssueId: issue.id,
          relatedUserId: req.user.id
        });
      }
    }

    return res.status(201).json(issue);
  } catch (err) {
    console.error('Error creating issue:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function listIssues(req, res) {
  try {
    console.log('=== LIST ISSUES (sprint-based) ===');
    const { myIssuesOnly, sprintId } = req.query;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Authentication required' });
    if (!sprintId) return res.status(400).json({ message: 'sprintId query param required' });

    const { allowed, sprint } = await resolveSprintAccess(Number(sprintId), userId);
    if (!allowed) return res.status(403).json({ message: 'Access denied to sprint' });

    const whereConditions = { sprintId: sprint.id };
    if (myIssuesOnly === 'true') whereConditions.assigneeId = userId;

    const issues = await Issue.findAll({
      where: whereConditions,
      order: [['createdAt', 'DESC']],
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name'] },
        { model: User, as: 'creator', attributes: ['id', 'name'] }
      ]
    });
    return res.json(issues);
  } catch (err) {
    console.error('ERROR listIssues:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function getIssue(req, res) {
  try {
    const id = Number(req.params.id);
    const userId = req.user.id;
    const issue = await Issue.findByPk(id, {
      include: [
        { model: Sprint, as: 'sprint', include: [{ model: Project, as: 'project', include: [{ model: Client, as: 'client' }] }] },
        { model: User, as: 'assignee', attributes: ['id', 'name'] },
        { model: User, as: 'creator', attributes: ['id', 'name'] }
      ]
    });
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    const { allowed } = await resolveSprintAccess(issue.sprintId, userId);
    if (!allowed) return res.status(403).json({ message: 'Access denied' });
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
    const issue = await Issue.findByPk(id, {
      include: [
        { model: Sprint, as: 'sprint', include: [{ model: Project, as: 'project' }] },
        { model: User, as: 'assignee', attributes: ['id', 'name'] }
      ]
    });
    if (!issue) return res.status(404).json({ message: 'Issue not found' });
    const { allowed } = await resolveSprintAccess(issue.sprintId, userId);
    if (!allowed) return res.status(403).json({ message: 'Access denied' });

    const { title, description, type, priority, status, assigneeId } = req.body || {};
    
    // Suivre les changements pour les notifications
    const oldAssigneeId = issue.assigneeId;
    const oldStatus = issue.status;
    
    if (title !== undefined) issue.title = title;
    if (description !== undefined) issue.description = description;
    if (type !== undefined) issue.type = type;
    if (priority !== undefined) issue.priority = priority;
    if (status !== undefined) issue.status = status;
    if (assigneeId !== undefined) issue.assigneeId = assigneeId;
    await issue.save();

    // Notification pour changement d'assignement
    if (assigneeId !== undefined && assigneeId !== oldAssigneeId && assigneeId !== null && assigneeId !== userId) {
      await createNotification({
        type: 'issue_assigned',
        message: `${req.user.name} vous a assigné(e) l'issue "${issue.title}"`,
        userId: assigneeId,
        relatedProjectId: issue.sprint.project.id,
        relatedIssueId: issue.id,
        relatedUserId: userId
      });
    }

    // Notification pour changement de statut (notifier l'assignee si différent)
    if (status !== undefined && status !== oldStatus && issue.assigneeId && issue.assigneeId !== userId) {
      const statusLabels = {
        todo: 'To Do',
        inprogress: 'In Progress',
        inreview: 'In Review',
        done: 'Done'
      };
      await createNotification({
        type: 'issue_status_changed',
        message: `${req.user.name} a changé le statut de "${issue.title}" en ${statusLabels[status] || status}`,
        userId: issue.assigneeId,
        relatedProjectId: issue.sprint.project.id,
        relatedIssueId: issue.id,
        relatedUserId: userId
      });
    }

    return res.json(issue);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function deleteIssue(req, res) {
  try {
    const id = Number(req.params.id);
    const userId = req.user.id;
    const issue = await Issue.findByPk(id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });
    const { allowed } = await resolveSprintAccess(issue.sprintId, userId);
    if (!allowed) return res.status(403).json({ message: 'Access denied' });
    await issue.destroy();
    return res.json({ message: 'Issue deleted successfully' });
  } catch (err) {
    console.error('Error deleting issue:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { createIssue, listIssues, getIssue, updateIssue, deleteIssue };
