// Test helper to build and export the Express app without starting the server (for Supertest)
const express = require('express');
const cors = require('cors');

// Ensure test process connects to the compose Postgres service when running inside Docker
process.env.DB_HOST = process.env.DB_HOST || 'db';
process.env.DB_PORT = process.env.DB_PORT || '5432';
process.env.DB_USER = process.env.DB_USER || 'postgres';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'postgres';
process.env.DB_NAME = process.env.DB_NAME || 'saas_dev';

const sequelize = require('../src/config/database');

// Import models to register them with sequelize
const User = require('../src/models/user');
const Issue = require('../src/models/issue');

const authRoutes = require('../src/routes/auth');
const issueRoutes = require('../src/routes/issues');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);

// Ensure DB is synced before tests run
let synced = false;
async function ensureDb() {
  if (synced) return;
  await sequelize.authenticate();
  // Force sync in test environment to ensure a clean DB between runs
  await sequelize.sync({ force: true });
  synced = true;
}

// Jest/Supertest will import this; tests should call ensureDb before running if needed.
module.exports = app;
module.exports.ensureDb = ensureDb;
