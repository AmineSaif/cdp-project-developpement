const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const Client = sequelize.define('Client', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ownerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Utilisateur propriétaire du client (créateur)'
  }
}, {
  tableName: 'clients',
  timestamps: true
});

module.exports = Client;
