const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('admin','developer','tester'),
    defaultValue: 'developer'
  },
  teamId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'teams',
      key: 'id'
    }
  }
}, {
  tableName: 'users',
  timestamps: true
});

module.exports = User;
