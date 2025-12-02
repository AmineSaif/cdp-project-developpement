const { Project, Client, Issue, Sprint, ProjectMember, User } = require('../models');
const { Op } = require('sequelize');

/**
 * Obtenir les statistiques d'un projet
 * GET /api/projects/:id/stats
 */
exports.getProjectStats = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Vérifier l'accès au projet
    const project = await Project.findByPk(id);

    if (!project) {
      return res.status(404).json({ error: 'Projet non trouvé' });
    }

    // Vérifier si l'utilisateur est le créateur du projet
    const isCreator = project.createdById === userId;
    
    // Vérifier si l'utilisateur est membre du projet
    const membership = await ProjectMember.findOne({ where: { projectId: id, userId } });
    const isMember = !!membership;

    if (!isCreator && !isMember) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    // 1. Récupérer tous les sprints du projet
    const sprints = await Sprint.findAll({
      where: { projectId: id },
      attributes: ['id', 'name', 'status', 'startDate', 'endDate'],
      include: [{ 
        model: Issue, 
        as: 'issues', 
        attributes: ['id', 'status', 'priority', 'createdAt', 'updatedAt', 'assigneeId']
      }]
    });

    // 2. Extraire toutes les issues de tous les sprints
    const allIssues = sprints.flatMap(sprint => sprint.issues || []);

    // 3. Stats générales
    const totalIssues = allIssues.length;
    const statusCounts = {
      todo: allIssues.filter(i => i.status === 'todo').length,
      in_progress: allIssues.filter(i => i.status === 'inprogress').length,
      review: allIssues.filter(i => i.status === 'inreview').length,
      done: allIssues.filter(i => i.status === 'done').length
    };

    const issuesByStatus = [
      { status: 'todo', count: statusCounts.todo },
      { status: 'in_progress', count: statusCounts.in_progress },
      { status: 'review', count: statusCounts.review },
      { status: 'done', count: statusCounts.done }
    ];

    const priorityCounts = {
      low: allIssues.filter(i => i.priority === 'low').length,
      medium: allIssues.filter(i => i.priority === 'medium').length,
      high: allIssues.filter(i => i.priority === 'high').length,
      critical: allIssues.filter(i => i.priority === 'critical').length
    };

    const issuesByPriority = [
      { priority: 'low', count: priorityCounts.low },
      { priority: 'medium', count: priorityCounts.medium },
      { priority: 'high', count: priorityCounts.high },
      { priority: 'critical', count: priorityCounts.critical }
    ];

    // 4. Membres actifs
    const members = await ProjectMember.findAll({
      where: { projectId: id },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }]
    });
    const totalMembers = members.length + 1; // +1 pour le propriétaire

    // 5. Stats des sprints (déjà récupérés)

    const sprintsStats = sprints.map(sprint => ({
      id: sprint.id,
      name: sprint.name,
      status: sprint.status,
      totalIssues: sprint.issues.length,
      completedIssues: sprint.issues.filter(i => i.status === 'done').length,
      completionRate: sprint.issues.length > 0 
        ? Math.round((sprint.issues.filter(i => i.status === 'done').length / sprint.issues.length) * 100)
        : 0
    }));

    // 6. Activité récente (derniers 7 jours)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentIssues = allIssues.filter(i => new Date(i.createdAt) > sevenDaysAgo).length;

    // 7. Évolution hebdomadaire (4 dernières semaines)
    const weeklyProgress = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
      const weekEnd = new Date();
      weekEnd.setDate(weekEnd.getDate() - i * 7);
      
      const completed = allIssues.filter(issue => {
        const updatedDate = new Date(issue.updatedAt);
        return issue.status === 'done' && updatedDate >= weekStart && updatedDate < weekEnd;
      }).length;

      weeklyProgress.push({
        week: `S-${i + 1}`,
        completed
      });
    }

    // 8. Sprint actif (burndown)
    const activeSprint = sprints.find(s => s.status === 'active');
    let burndownData = [];
    if (activeSprint && activeSprint.startDate && activeSprint.endDate) {
      const sprintIssues = activeSprint.issues;
      const totalSprintIssues = sprintIssues.length;
      const completedSprintIssues = sprintIssues.filter(i => i.status === 'done').length;
      
      const startDate = new Date(activeSprint.startDate);
      const endDate = new Date(activeSprint.endDate);
      const today = new Date();
      
      const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      const daysElapsed = Math.min(
        Math.ceil((today - startDate) / (1000 * 60 * 60 * 24)),
        totalDays
      );
      
      // Générer les données de burndown
      for (let day = 0; day <= Math.min(daysElapsed, totalDays); day++) {
        const idealRemaining = Math.max(0, totalSprintIssues - (totalSprintIssues / totalDays) * day);
        const actualRemaining = day === daysElapsed 
          ? totalSprintIssues - completedSprintIssues 
          : Math.max(0, totalSprintIssues - Math.floor((completedSprintIssues / daysElapsed) * day));
        
        burndownData.push({
          day,
          remaining: actualRemaining,
          ideal: Math.round(idealRemaining)
        });
      }
    }

    // 9. Santé du projet
    const unassignedIssues = allIssues.filter(i => !i.assigneeId).length;
    const blockedIssues = 0; // À implémenter si vous avez un champ "blocked"

    res.json({
      overview: {
        totalIssues,
        completedIssues: statusCounts.done,
        inProgress: statusCounts.in_progress,
        totalMembers,
        totalSprints: sprints.length,
        activeSprints: sprints.filter(s => s.status === 'active').length,
        recentActivity: recentIssues
      },
      issuesByStatus,
      issuesByPriority,
      sprints: sprintsStats,
      weeklyProgress,
      burndown: burndownData,
      health: {
        unassignedIssues,
        blockedIssues,
        completionRate: totalIssues > 0 
          ? Math.round((statusCounts.done / totalIssues) * 100)
          : 0
      }
    });
  } catch (error) {
    console.error('Erreur récupération stats projet:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
};
