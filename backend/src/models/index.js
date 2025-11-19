const User = require('./user');
const Issue = require('./issue');
const Team = require('./team');

// Relations Team <-> User
Team.hasMany(User, { foreignKey: 'teamId', as: 'members' });
User.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });

// Relations Team <-> Issue
Team.hasMany(Issue, { foreignKey: 'teamId', as: 'issues' });
Issue.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });

// Relations User <-> Issue (existantes)
User.hasMany(Issue, { foreignKey: 'createdById', as: 'createdIssues' });
Issue.belongsTo(User, { foreignKey: 'createdById', as: 'creator' });

User.hasMany(Issue, { foreignKey: 'assigneeId', as: 'assignedIssues' });
Issue.belongsTo(User, { foreignKey: 'assigneeId', as: 'assignee' });

// Relations Team creator
User.hasMany(Team, { foreignKey: 'createdById', as: 'createdTeams' });
Team.belongsTo(User, { foreignKey: 'createdById', as: 'creator' });

module.exports = { User, Issue, Team };
