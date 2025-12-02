const User = require('./user');
const Issue = require('./issue');
const Team = require('./team');
const Client = require('./client');
const Project = require('./project');
const Sprint = require('./sprint');
const ProjectMember = require('./projectMember');
const Notification = require('./notification');

// ============ Relations Client ============
// Client <-> User (owner)
User.hasMany(Client, { foreignKey: 'ownerId', as: 'ownedClients' });
Client.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

// Client <-> Project
Client.hasMany(Project, { foreignKey: 'clientId', as: 'projects' });
Project.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });

// ============ Relations Project ============
// Project <-> User (creator)
User.hasMany(Project, { foreignKey: 'createdById', as: 'createdProjects' });
Project.belongsTo(User, { foreignKey: 'createdById', as: 'creator' });

// Project <-> Sprint
Project.hasMany(Sprint, { foreignKey: 'projectId', as: 'sprints' });
Sprint.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

// Project <-> ProjectMember
Project.hasMany(ProjectMember, { foreignKey: 'projectId', as: 'memberships' });
ProjectMember.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

// User <-> ProjectMember
User.hasMany(ProjectMember, { foreignKey: 'userId', as: 'projectMemberships' });
ProjectMember.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// ============ Relations Sprint ============
// Sprint <-> User (creator)
User.hasMany(Sprint, { foreignKey: 'createdById', as: 'createdSprints' });
Sprint.belongsTo(User, { foreignKey: 'createdById', as: 'creator' });

// Sprint <-> Issue
Sprint.hasMany(Issue, { foreignKey: 'sprintId', as: 'issues' });
Issue.belongsTo(Sprint, { foreignKey: 'sprintId', as: 'sprint' });

// ============ Relations Team (legacy) ============
Team.hasMany(User, { foreignKey: 'teamId', as: 'members' });
User.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });

// Team <-> Issue (deprecated, garder pour compatibilité)
Team.hasMany(Issue, { foreignKey: 'teamId', as: 'issues' });
Issue.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });

User.hasMany(Team, { foreignKey: 'createdById', as: 'createdTeams' });
Team.belongsTo(User, { foreignKey: 'createdById', as: 'creator' });

// ============ Relations User <-> Issue ============
User.hasMany(Issue, { foreignKey: 'createdById', as: 'createdIssues' });
Issue.belongsTo(User, { foreignKey: 'createdById', as: 'creator' });

User.hasMany(Issue, { foreignKey: 'assigneeId', as: 'assignedIssues' });
Issue.belongsTo(User, { foreignKey: 'assigneeId', as: 'assignee' });

// ============ Relations Notification ============
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Notification <-> Project (optionnel)
Project.hasMany(Notification, { foreignKey: 'relatedProjectId', as: 'notifications' });
Notification.belongsTo(Project, { foreignKey: 'relatedProjectId', as: 'relatedProject' });

// Notification <-> Issue (optionnel)
Issue.hasMany(Notification, { foreignKey: 'relatedIssueId', as: 'notifications' });
Notification.belongsTo(Issue, { foreignKey: 'relatedIssueId', as: 'relatedIssue' });

// Notification <-> User (acteur qui a déclenché la notification)
Notification.belongsTo(User, { foreignKey: 'relatedUserId', as: 'relatedUser' });

module.exports = { User, Issue, Team, Client, Project, Sprint, ProjectMember, Notification };
