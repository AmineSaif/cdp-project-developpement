const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const Team = sequelize.define('Team', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Mon Équipe'
  },
  teamCode: {
    type: DataTypes.STRING(8),
    allowNull: true,
    comment: 'Code unique pour rejoindre l\'équipe'
  },
  createdById: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'teams',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['teamCode']
    }
  ]
});

module.exports = Team;
