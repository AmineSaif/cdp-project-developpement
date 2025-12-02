const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  type: {
    type: DataTypes.ENUM(
      'issue_assigned',        // Assignement d'une issue
      'issue_status_changed',  // Changement de statut
      'project_member_joined', // Nouveau membre dans le projet
      'issue_created',         // Nouvelle issue créée
      'sprint_created',        // Nouveau sprint
      'other'
    ),
    allowNull: false,
    defaultValue: 'other'
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Utilisateur qui reçoit la notification'
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  relatedProjectId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'projects',
      key: 'id'
    },
    comment: 'Projet lié à la notification'
  },
  relatedIssueId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'issues',
      key: 'id'
    },
    comment: 'Issue liée à la notification'
  },
  relatedUserId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Utilisateur qui a déclenché la notification (acteur)'
  }
}, {
  tableName: 'notifications',
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['isRead'] },
    { fields: ['createdAt'] }
  ]
});

module.exports = Notification;
