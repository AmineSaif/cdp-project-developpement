const { Sprint, Project, Client, Issue, User, ProjectMember } = require('../models');

/**
 * Créer un nouveau sprint
 * POST /api/sprints
 */
exports.createSprint = async (req, res) => {
  try {
    const { name, description, projectId, startDate, endDate } = req.body;
    const userId = req.user.id;

    // Vérifier l'accès au projet (propriétaire OU membre)
    const project = await Project.findOne({
      where: { id: projectId },
      include: [{ model: Client, as: 'client', attributes: ['ownerId'] }]
    });

    if (!project) {
      return res.status(404).json({ error: 'Projet non trouvé' });
    }

    const isOwner = project.client && project.client.ownerId === userId;
    const membership = await ProjectMember.findOne({
      where: { projectId, userId }
    });
    const isMember = !!membership;

    if (!isOwner && !isMember) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    const sprint = await Sprint.create({
      name,
      description,
      projectId,
      startDate,
      endDate,
      status: 'planned',
      createdById: userId
    });

    res.status(201).json({ sprint, message: 'Sprint créé avec succès' });
  } catch (error) {
    console.error('Erreur création sprint:', error);
    res.status(500).json({ error: 'Erreur lors de la création du sprint' });
  }
};

/**
 * Lister les sprints d'un projet
 * GET /api/sprints?projectId=X
 */
exports.listSprints = async (req, res) => {
  try {
    const { projectId } = req.query;
    const userId = req.user.id;

    // Vérifier l'accès au projet (propriétaire OU membre)
    const project = await Project.findOne({
      where: { id: projectId },
      include: [{ model: Client, as: 'client', attributes: ['ownerId'] }]
    });

    if (!project) {
      return res.status(404).json({ error: 'Projet non trouvé' });
    }

    const isOwner = project.client && project.client.ownerId === userId;
    const membership = await ProjectMember.findOne({
      where: { projectId, userId }
    });
    const isMember = !!membership;

    if (!isOwner && !isMember) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    const sprints = await Sprint.findAll({
      where: { projectId },
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { 
          model: Issue, 
          as: 'issues',
          attributes: ['id', 'title', 'status', 'priority']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ sprints });
  } catch (error) {
    console.error('Erreur liste sprints:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des sprints' });
  }
};

/**
 * Obtenir un sprint par ID
 * GET /api/sprints/:id
 */
exports.getSprint = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const sprint = await Sprint.findOne({
      where: { id },
      include: [
        {
          model: Project,
          as: 'project',
          include: [{ model: Client, as: 'client', attributes: ['ownerId'] }]
        },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { 
          model: Issue, 
          as: 'issues',
          include: [
            { model: User, as: 'assignee', attributes: ['id', 'name'] },
            { model: User, as: 'creator', attributes: ['id', 'name'] }
          ]
        }
      ]
    });

    if (!sprint) {
      return res.status(404).json({ error: 'Sprint non trouvé' });
    }

    const isOwner = sprint.project.client && sprint.project.client.ownerId === userId;
    const membership = await ProjectMember.findOne({
      where: { projectId: sprint.project.id, userId }
    });
    const isMember = !!membership;

    if (!isOwner && !isMember) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    res.json({ sprint });
  } catch (error) {
    console.error('Erreur récupération sprint:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du sprint' });
  }
};

/**
 * Mettre à jour un sprint
 * PATCH /api/sprints/:id
 */
exports.updateSprint = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, startDate, endDate, status } = req.body;
    const userId = req.user.id;

    const sprint = await Sprint.findOne({
      where: { id },
      include: [
        {
          model: Project,
          as: 'project',
          include: [{ model: Client, as: 'client', attributes: ['ownerId'] }]
        }
      ]
    });

    if (!sprint) {
      return res.status(404).json({ error: 'Sprint non trouvé' });
    }

    const isOwner = sprint.project.client && sprint.project.client.ownerId === userId;
    const membership = await ProjectMember.findOne({
      where: { projectId: sprint.project.id, userId }
    });
    const isMember = !!membership;

    if (!isOwner && !isMember) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    await sprint.update({
      name: name || sprint.name,
      description: description !== undefined ? description : sprint.description,
      startDate: startDate !== undefined ? startDate : sprint.startDate,
      endDate: endDate !== undefined ? endDate : sprint.endDate,
      status: status || sprint.status
    });

    res.json({ sprint, message: 'Sprint mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur mise à jour sprint:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du sprint' });
  }
};

/**
 * Supprimer un sprint
 * DELETE /api/sprints/:id
 */
exports.deleteSprint = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const sprint = await Sprint.findOne({
      where: { id },
      include: [
        {
          model: Project,
          as: 'project',
          include: [{ model: Client, as: 'client', attributes: ['ownerId'] }]
        }
      ]
    });

    if (!sprint) {
      return res.status(404).json({ error: 'Sprint non trouvé' });
    }

    const isOwner = sprint.project.client && sprint.project.client.ownerId === userId;
    const membership = await ProjectMember.findOne({
      where: { projectId: sprint.project.id, userId }
    });
    const isMember = !!membership;

    if (!isOwner && !isMember) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    await sprint.destroy();

    res.json({ message: 'Sprint supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression sprint:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du sprint' });
  }
};
