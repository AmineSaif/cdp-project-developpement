const { Notification, User, Project, Issue } = require('../models');

/**
 * Lister les notifications de l'utilisateur connecté
 * GET /api/notifications
 */
exports.listNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0 } = req.query;

    const notifications = await Notification.findAll({
      where: { userId },
      include: [
        { 
          model: User, 
          as: 'relatedUser', 
          attributes: ['id', 'name', 'email'],
          required: false
        },
        { 
          model: Project, 
          as: 'relatedProject', 
          attributes: ['id', 'name'],
          required: false
        },
        { 
          model: Issue, 
          as: 'relatedIssue', 
          attributes: ['id', 'title'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const total = await Notification.count({ where: { userId } });
    const unreadCount = await Notification.count({ where: { userId, isRead: false } });

    res.json({ 
      notifications,
      total,
      unreadCount
    });
  } catch (error) {
    console.error('Erreur liste notifications:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des notifications' });
  }
};

/**
 * Obtenir le nombre de notifications non lues
 * GET /api/notifications/unread-count
 */
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await Notification.count({ 
      where: { userId, isRead: false } 
    });

    res.json({ count });
  } catch (error) {
    console.error('Erreur comptage notifications:', error);
    res.status(500).json({ error: 'Erreur lors du comptage des notifications' });
  }
};

/**
 * Marquer une notification comme lue
 * PATCH /api/notifications/:id/read
 */
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOne({
      where: { id, userId }
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification non trouvée' });
    }

    await notification.update({ isRead: true });

    res.json({ 
      notification,
      message: 'Notification marquée comme lue'
    });
  } catch (error) {
    console.error('Erreur mise à jour notification:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la notification' });
  }
};

/**
 * Marquer toutes les notifications comme lues
 * PATCH /api/notifications/read-all
 */
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    const [updated] = await Notification.update(
      { isRead: true },
      { where: { userId, isRead: false } }
    );

    res.json({ 
      message: `${updated} notification(s) marquée(s) comme lue(s)`
    });
  } catch (error) {
    console.error('Erreur mise à jour notifications:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour des notifications' });
  }
};

/**
 * Supprimer une notification
 * DELETE /api/notifications/:id
 */
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOne({
      where: { id, userId }
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification non trouvée' });
    }

    await notification.destroy();

    res.json({ message: 'Notification supprimée avec succès' });
  } catch (error) {
    console.error('Erreur suppression notification:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la notification' });
  }
};
