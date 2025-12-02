const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const ProjectMember = sequelize.define('ProjectMember', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'projects', key: 'id' }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  },
  role: {
    type: DataTypes.STRING(32),
    allowNull: true,
    comment: 'Role dans le projet (ex: member, admin)'
  }
}, {
  tableName: 'project_members',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['projectId', 'userId'] }
  ]
});

module.exports = ProjectMember;
