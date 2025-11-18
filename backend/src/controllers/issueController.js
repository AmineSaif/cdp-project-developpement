const Issue = require('../models/issue');
const User = require('../models/user');

async function createIssue(req, res) {
  const { title, description, type, priority, assigneeId } = req.body || {};
  if (!title) return res.status(400).json({ message: 'title is required' });
  
  try {
    // Let Sequelize use the model defaults - don't override them
    const issue = await Issue.create({
      title,
      description: description || '',
      type, // will default to 'task' if not provided
      priority, // will default to 'low' if not provided  
      // status will default to 'todo' automatically
      assigneeId: assigneeId || null,
      createdById: req.user.id
    });
    
    return res.status(201).json(issue);
  } catch (err) {
    console.error('Error creating issue:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function listIssues(req, res) {
  try {
    const issues = await Issue.findAll({
      order: [['createdAt', 'DESC']]
    });
    return res.json(issues);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function getIssue(req, res) {
  try {
    const id = Number(req.params.id);
    const issue = await Issue.findByPk(id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });
    return res.json(issue);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function updateIssue(req, res) {
  try {
    const id = Number(req.params.id);
    const issue = await Issue.findByPk(id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    // only allow certain fields to be updated
    const { title, description, type, priority, status, assigneeId } = req.body || {};
    if (title !== undefined) issue.title = title;
    if (description !== undefined) issue.description = description;
    if (type !== undefined) issue.type = type;
    if (priority !== undefined) issue.priority = priority;
    if (status !== undefined) issue.status = status;
    if (assigneeId !== undefined) issue.assigneeId = assigneeId;

    await issue.save();
    return res.json(issue);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function deleteIssue(req, res) {
  try {
    console.log('DELETE ISSUE CALLED - ID:', req.params.id);
    const id = Number(req.params.id);
    console.log('Looking for issue with ID:', id);
    
    const issue = await Issue.findByPk(id);
    console.log('Found issue:', issue ? 'YES' : 'NO');
    
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    console.log('Destroying issue...');
    await issue.destroy();
    console.log('Issue deleted successfully');
    
    return res.json({ message: 'Issue deleted successfully' });
  } catch (err) {
    console.error('Error deleting issue:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { createIssue, listIssues, getIssue, updateIssue, deleteIssue };
