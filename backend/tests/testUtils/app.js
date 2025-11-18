// Test helper to build and export the Express app without starting the server (for Supertest)
const express = require('express');
const cors = require('cors');
const sequelize = require('../../src/config/database');

// Import models to register them with sequelize
const User = require('../../src/models/user');
const Issue = require('../../src/models/issue');

const authRoutes = require('../../src/routes/auth');
const issueRoutes = require('../../src/routes/issues');

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
  await sequelize.sync({ alter: true });
  synced = true;
}

// Jest/Supertest will import this; tests should call ensureDb before running if needed.
module.exports = app;
module.exports.ensureDb = ensureDb;
