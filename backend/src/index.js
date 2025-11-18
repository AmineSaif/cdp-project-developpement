const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const sequelize = require('./config/database');

console.log('DB CONFIG ->', { host: process.env.DB_HOST, port: process.env.DB_PORT, user: process.env.DB_USER, database: process.env.DB_NAME });

// Import models to register them with sequelize
const User = require('./models/user');
const Issue = require('./models/issue');

// Define associations (simple)
Issue.belongsTo(User, { as: 'assignee', foreignKey: 'assigneeId' });
Issue.belongsTo(User, { as: 'creator', foreignKey: 'createdById' });

const authRoutes = require('./routes/auth');
const issueRoutes = require('./routes/issues');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.json({ status: 'ok', env: process.env.NODE_ENV || 'dev' }));

app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

async function start() {
  try {
    await sequelize.authenticate();
    // Sync models (safe for dev). In production, use migrations.
    console.log('Syncing database schema...');
    await sequelize.sync({ force: false, alter: true });
    console.log('Database schema synced successfully');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();
