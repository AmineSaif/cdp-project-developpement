const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  projectCode: {
    type: DataTypes.STRING(8),
    allowNull: false,
    // Ne pas mettre unique ici pour éviter ALTER COLUMN TYPE ... UNIQUE (bug Postgres)
    comment: 'Code unique pour rejoindre le projet (index unique séparé)'
  },
  joinLocked: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Quand vrai, la jonction via code est désactivée'
  },
  clientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'clients',
      key: 'id'
    }
  },
  createdById: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'projects',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['projectCode']
    }
  ]
});

module.exports = Project;
