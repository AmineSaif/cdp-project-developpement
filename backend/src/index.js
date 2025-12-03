const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const sequelize = require('./config/database');

console.log('DB CONFIG ->', { host: process.env.DB_HOST, port: process.env.DB_PORT, user: process.env.DB_USER, database: process.env.DB_NAME });

// Import models and define associations
// Import all models (side-effect: associations defined)
const { User, Issue, Team, Client, Project, Sprint } = require('./models');

const authRoutes = require('./routes/auth');
const issueRoutes = require('./routes/issues');
const teamRoutes = require('./routes/teams'); // legacy
const clientRoutes = require('./routes/clients');
const projectRoutes = require('./routes/projects');
const sprintRoutes = require('./routes/sprints');
const notificationRoutes = require('./routes/notifications');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.json({ status: 'ok', env: process.env.NODE_ENV || 'dev' }));

app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/teams', teamRoutes); // legacy routes (peuvent être retirées plus tard)
app.use('/api/clients', clientRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/sprints', sprintRoutes);
app.use('/api/notifications', notificationRoutes);

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

async function start() {
  try {
    await sequelize.authenticate();
    // Sync models (safe for dev). In production, use migrations.
    console.log('Syncing database schema...');
    // Désactiver alter pour ne pas imposer des ALTER NOT NULL sur une base existante
    await sequelize.sync({ force: false });
    console.log('Database schema synced successfully');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();
