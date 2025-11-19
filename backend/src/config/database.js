const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config();

// DEBUG: Afficher les variables d'environnement
console.log('DB CONFIG ->', {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || '5432',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD ? '***SET***' : 'NOT SET (using default)',
  database: process.env.DB_NAME || 'saas_dev'
});

const sequelize = new Sequelize(
  process.env.DB_NAME || 'saas_dev',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
    dialect: 'postgres',
    logging: false,
  }
);

module.exports = sequelize;