const { Project, Client, Sprint, User, ProjectMember } = require('../models');
const { generateUniqueProjectCode } = require('../utils/projectCodeGenerator');
const { createNotifications } = require('../utils/notificationHelper');

/**
 * Créer un nouveau projet
 * POST /api/projects
 */
exports.createProject = async (req, res) => {
  try {
    const { name, description, clientId } = req.body;
    const userId = req.user.id;

    let client;
    if (clientId) {
      // Vérifier que le client existe et appartient à l'utilisateur
      client = await Client.findOne({
        where: { id: clientId, ownerId: userId }
      });
      if (!client) {
        return res.status(403).json({ error: 'Client non trouvé ou accès non autorisé' });
      }
    } else {
      // Créer automatiquement un client si non fourni
      client = await Client.create({
        name: `Client pour ${name}`,
        ownerId: userId
      });
    }

    // Générer un code projet unique
    const projectCode = await generateUniqueProjectCode();

    const project = await Project.create({
      name,
      description,
      projectCode,
      clientId: client.id,
      createdById: userId
    });

    // Créer un sprint initial par défaut
    await Sprint.create({
      name: 'Sprint 1',
      projectId: project.id,
      status: 'planned',
      createdById: userId
    });

    res.status(201).json({ 
      project,
      message: 'Projet créé avec succès',
      projectCode 
    });
  } catch (error) {
    console.error('Erreur création projet:', error);
    res.status(500).json({ error: 'Erreur lors de la création du projet' });
  }
};

/**
 * Lister les sprints d'un projet
 * GET /api/projects/:id/sprints
 */
exports.getProjectSprints = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Vérifier que l'utilisateur a accès au projet (propriétaire ou membre)
    const project = await Project.findOne({
      where: { id },
      include: [{ model: Client, as: 'client', attributes: ['ownerId'] }]
    });

    if (!project) {
      return res.status(404).json({ error: 'Projet non trouvé' });
    }

    const isOwner = project.client && project.client.ownerId === userId;
    const membership = await ProjectMember.findOne({ where: { projectId: id, userId } });
    if (!isOwner && !membership) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    const sprints = await Sprint.findAll({
      where: { projectId: id },
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'name', 'status', 'startDate', 'endDate']
    });

    res.json(sprints);
  } catch (error) {
    console.error('Erreur récupération sprints du projet:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des sprints' });
  }
};

/**
 * Lister les projets.
 * - Si clientId fourni: projets de ce client (vérification owner)
 * - Sinon: tous les projets de tous les clients appartenant à l'utilisateur
 * GET /api/projects?clientId=ID
 */
exports.listProjects = async (req, res) => {
  try {
    const { clientId } = req.query;
    const userId = req.user.id;

    const memberships = await ProjectMember.findAll({ where: { userId }, attributes: ['projectId'] });
    const membershipProjectIds = new Set(memberships.map(m => m.projectId));

    // Récupérer les projets où l'utilisateur est propriétaire ou membre
    const projectsRaw = await Project.findAll({
      include: [
        { model: Client, as: 'client', attributes: ['id', 'name', 'ownerId'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: Sprint, as: 'sprints', attributes: ['id', 'name', 'status', 'startDate', 'endDate'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    const filtered = projectsRaw.filter(p => {
      const owned = p.client && p.client.ownerId === userId;
      const member = membershipProjectIds.has(p.id);
      const clientMatch = clientId ? (p.client && String(p.client.id) === String(clientId)) : true;
      return clientMatch && (owned || member);
    });    res.json({ projects: filtered });
  } catch (error) {
    console.error('Erreur liste projets:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des projets' });
  }
};

/**
 * Obtenir un projet par ID
 * GET /api/projects/:id
 */
exports.getProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const project = await Project.findOne({
      where: { id },
      include: [
        { 
          model: Client, 
          as: 'client',
          where: { ownerId: userId },
          attributes: ['id', 'name']
        },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { 
          model: Sprint, 
          as: 'sprints',
          attributes: ['id', 'name', 'status', 'startDate', 'endDate']
        }
      ]
    });

    if (!project) {
      return res.status(404).json({ error: 'Projet non trouvé' });
    }

    res.json({ project });
  } catch (error) {
    console.error('Erreur récupération projet:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du projet' });
  }
};

/**
 * Rejoindre un projet avec un code
 * POST /api/projects/join
 */
exports.joinProject = async (req, res) => {
  try {
    const { projectCode } = req.body;
    const userId = req.user.id;

    if (!projectCode || !projectCode.trim()) {
      return res.status(400).json({ error: 'Code projet requis' });
    }

    const project = await Project.findOne({
      where: { projectCode: projectCode.trim() },
      include: [
        { model: Client, as: 'client', attributes: ['id', 'name', 'ownerId'] },
        { model: Sprint, as: 'sprints', attributes: ['id', 'name', 'status', 'startDate', 'endDate'] }
      ]
    });

    if (!project) {
      return res.status(404).json({ error: 'Projet non trouvé avec ce code' });
    }

    // Vérifier verrouillage des inscriptions
    if (project.joinLocked) {
      return res.status(403).json({ error: 'Les inscriptions à ce projet sont désactivées' });
    }

    // Créer une membership (ou ignorer si déjà présent)
    const [membership, created] = await ProjectMember.findOrCreate({
      where: { projectId: project.id, userId },
      defaults: { role: 'member' }
    });

    // Si nouveau membre, notifier tous les autres membres du projet
    if (created) {
      const newMember = await User.findByPk(userId);
      
      // Récupérer tous les membres existants + propriétaire
      const existingMembers = await ProjectMember.findAll({
        where: { projectId: project.id },
        attributes: ['userId']
      });
      
      const memberUserIds = existingMembers.map(m => m.userId);
      
      // Ajouter le propriétaire s'il n'est pas déjà dans la liste
      if (project.client.ownerId && !memberUserIds.includes(project.client.ownerId)) {
        memberUserIds.push(project.client.ownerId);
      }

      // Notifier tous les membres (sauf le nouveau)
      await createNotifications({
        type: 'project_member_joined',
        message: `${newMember.name} a rejoint le projet "${project.name}"`,
        userIds: memberUserIds,
        relatedProjectId: project.id,
        relatedUserId: userId
      });
    }

    res.json({ 
      project,
      message: 'Vous avez rejoint le projet avec succès'
    });
  } catch (error) {
    console.error('Erreur rejoindre projet:', error);
    res.status(500).json({ error: 'Erreur lors de la jonction au projet' });
  }
};

/**
 * Activer/Désactiver les nouvelles inscriptions (propriétaire uniquement)
 * PATCH /api/projects/:id/join-lock { joinLocked: boolean }
 */
exports.setJoinLock = async (req, res) => {
  try {
    const { id } = req.params;
    const { joinLocked } = req.body;
    const userId = req.user.id;

    if (typeof joinLocked !== 'boolean') {
      return res.status(400).json({ error: 'Paramètre joinLocked requis (boolean)' });
    }

    const project = await Project.findOne({
      where: { id },
      include: [{ model: Client, as: 'client', attributes: ['ownerId'] }]
    });

    if (!project) {
      return res.status(404).json({ error: 'Projet non trouvé' });
    }

    const isOwner = project.client && project.client.ownerId === userId;
    if (!isOwner) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    project.joinLocked = joinLocked;
    await project.save();
    res.json({ message: 'Paramètre mis à jour', joinLocked: project.joinLocked, project });
  } catch (error) {
    console.error('Erreur mise à jour joinLocked:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du verrouillage des inscriptions' });
  }
};

/**
 * Quitter un projet
 * POST /api/projects/:id/leave
 */
exports.leaveProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Vérifier que l'utilisateur n'est pas le propriétaire du projet
    const project = await Project.findOne({
      where: { id },
      include: [{ model: Client, as: 'client', attributes: ['ownerId'] }]
    });

    if (!project) {
      return res.status(404).json({ error: 'Projet non trouvé' });
    }

    if (project.client && project.client.ownerId === userId) {
      return res.status(403).json({ error: 'Le propriétaire ne peut pas quitter son propre projet. Supprimez-le à la place.' });
    }

    // Supprimer la membership
    const deleted = await ProjectMember.destroy({
      where: { projectId: id, userId }
    });

    if (deleted === 0) {
      return res.status(404).json({ error: 'Vous n\'êtes pas membre de ce projet' });
    }

    res.json({ message: 'Vous avez quitté le projet avec succès' });
  } catch (error) {
    console.error('Erreur quitter projet:', error);
    res.status(500).json({ error: 'Erreur lors de la sortie du projet' });
  }
};

/**
 * Mettre à jour un projet
 * PATCH /api/projects/:id
 */
exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const userId = req.user.id;

    const project = await Project.findOne({
      where: { id },
      include: [
        { 
          model: Client, 
          as: 'client',
          where: { ownerId: userId }
        }
      ]
    });

    if (!project) {
      return res.status(404).json({ error: 'Projet non trouvé ou accès non autorisé' });
    }

    await project.update({
      name: name || project.name,
      description: description !== undefined ? description : project.description
    });

    res.json({ project, message: 'Projet mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur mise à jour projet:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du projet' });
  }
};

/**
 * Régénérer un code projet unique (propriétaire uniquement)
 * POST /api/projects/:id/regenerate-code
 */
exports.regenerateProjectCode = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const project = await Project.findOne({
      where: { id },
      include: [
        { model: Client, as: 'client', attributes: ['ownerId'] }
      ]
    });

    if (!project) {
      return res.status(404).json({ error: 'Projet non trouvé' });
    }

    const isOwner = project.client && project.client.ownerId === userId;
    if (!isOwner) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    const newCode = await generateUniqueProjectCode();
    project.projectCode = newCode;
    await project.save();

    res.json({ message: 'Code projet régénéré', projectCode: newCode, project });
  } catch (error) {
    console.error('Erreur régénération code projet:', error);
    res.status(500).json({ error: 'Erreur lors de la régénération du code projet' });
  }
};

/**
 * Supprimer un projet
 * DELETE /api/projects/:id
 */
exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const project = await Project.findOne({
      where: { id },
      include: [
        { 
          model: Client, 
          as: 'client',
          where: { ownerId: userId }
        }
      ]
    });

    if (!project) {
      return res.status(404).json({ error: 'Projet non trouvé ou accès non autorisé' });
    }

    await project.destroy();

    res.json({ message: 'Projet supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression projet:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du projet' });
  }
};

/**
 * Obtenir les membres d'un projet (propriétaire + membres via ProjectMember)
 * GET /api/projects/:id/members
 */
exports.getProjectMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Vérifier l'accès au projet
    const project = await Project.findOne({
      where: { id },
      include: [{ model: Client, as: 'client', attributes: ['id', 'ownerId'] }]
    });

    if (!project) {
      return res.status(404).json({ error: 'Projet non trouvé' });
    }

    const isOwner = project.client && project.client.ownerId === userId;
    const membership = await ProjectMember.findOne({ where: { projectId: id, userId } });
    const isMember = !!membership;

    if (!isOwner && !isMember) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    // Récupérer le propriétaire
    const owner = await User.findByPk(project.client.ownerId, {
      attributes: ['id', 'name', 'email']
    });

    // Récupérer les membres
    const projectMembers = await ProjectMember.findAll({
      where: { projectId: id },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email']
      }],
      attributes: ['userId', 'role', 'createdAt']
    });

    // Combiner propriétaire et membres (en évitant les doublons)
    const membersList = [];
    if (owner) {
      membersList.push({
        ...owner.toJSON(),
        role: 'owner',
        joinedAt: project.createdAt
      });
    }

    projectMembers.forEach(pm => {
      if (pm.user && pm.userId !== project.client.ownerId) {
        membersList.push({
          ...pm.user.toJSON(),
          role: pm.role,
          joinedAt: pm.createdAt
        });
      }
    });

    res.json({ 
      members: membersList,
      isOwner
    });
  } catch (error) {
    console.error('Erreur récupération membres projet:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des membres' });
  }
};

/**
 * Supprimer un membre du projet (réservé au propriétaire)
 * DELETE /api/projects/:id/members/:userId
 */
exports.removeMember = async (req, res) => {
  try {
    const { id, userId: memberIdToRemove } = req.params;
    const userId = req.user.id;

    // Vérifier que le projet existe et que l'utilisateur est le propriétaire
    const project = await Project.findOne({
      where: { id },
      include: [{ model: Client, as: 'client', attributes: ['id', 'ownerId'] }]
    });

    if (!project) {
      return res.status(404).json({ error: 'Projet non trouvé' });
    }

    const isOwner = project.client && project.client.ownerId === userId;

    if (!isOwner) {
      return res.status(403).json({ error: 'Seul le propriétaire peut supprimer des membres' });
    }

    // Empêcher la suppression du propriétaire lui-même
    if (Number(memberIdToRemove) === project.client.ownerId) {
      return res.status(400).json({ error: 'Impossible de supprimer le propriétaire du projet' });
    }

    // Supprimer le membre
    const deleted = await ProjectMember.destroy({
      where: { projectId: id, userId: memberIdToRemove }
    });

    if (deleted === 0) {
      return res.status(404).json({ error: 'Membre non trouvé dans ce projet' });
    }

    res.json({ message: 'Membre supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression membre:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du membre' });
  }
};
