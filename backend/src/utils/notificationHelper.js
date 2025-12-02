const { Notification } = require('../models');

/**
 * Fonction utilitaire pour créer une notification
 * @param {Object} options
 * @param {string} options.type - Type de notification (issue_assigned, issue_status_changed, etc.)
 * @param {string} options.message - Message de la notification
 * @param {number} options.userId - ID de l'utilisateur qui reçoit la notification
 * @param {number} [options.relatedProjectId] - ID du projet lié (optionnel)
 * @param {number} [options.relatedIssueId] - ID de l'issue liée (optionnel)
 * @param {number} [options.relatedUserId] - ID de l'utilisateur qui a déclenché la notification (optionnel)
 */
async function createNotification({ type, message, userId, relatedProjectId, relatedIssueId, relatedUserId }) {
  try {
    // Ne pas créer de notification pour soi-même
    if (userId === relatedUserId) {
      return null;
    }

    const notification = await Notification.create({
      type,
      message,
      userId,
      relatedProjectId: relatedProjectId || null,
      relatedIssueId: relatedIssueId || null,
      relatedUserId: relatedUserId || null,
      isRead: false
    });

    return notification;
  } catch (error) {
    console.error('Erreur création notification:', error);
    return null;
  }
}

/**
 * Créer des notifications pour plusieurs utilisateurs
 * @param {Object} options
 * @param {string} options.type - Type de notification
 * @param {string} options.message - Message de la notification
 * @param {number[]} options.userIds - IDs des utilisateurs qui reçoivent la notification
 * @param {number} [options.relatedProjectId] - ID du projet lié (optionnel)
 * @param {number} [options.relatedIssueId] - ID de l'issue liée (optionnel)
 * @param {number} [options.relatedUserId] - ID de l'utilisateur qui a déclenché la notification (optionnel)
 */
async function createNotifications({ type, message, userIds, relatedProjectId, relatedIssueId, relatedUserId }) {
  try {
    const notifications = [];
    
    for (const userId of userIds) {
      // Ne pas créer de notification pour l'acteur
      if (userId !== relatedUserId) {
        const notification = await createNotification({
          type,
          message,
          userId,
          relatedProjectId,
          relatedIssueId,
          relatedUserId
        });
        if (notification) notifications.push(notification);
      }
    }

    return notifications;
  } catch (error) {
    console.error('Erreur création notifications multiples:', error);
    return [];
  }
}

module.exports = {
  createNotification,
  createNotifications
};
