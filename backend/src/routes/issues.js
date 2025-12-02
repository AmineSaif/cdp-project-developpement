const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const { createIssue, listIssues, getIssue, updateIssue, deleteIssue } = require('../controllers/issueController');
const { createIssueRules, handleValidation } = require('../validators/issueValidator');

// Nécessite sprintId en query: /api/issues?sprintId=XX&myIssuesOnly=true
router.get('/', authenticate, listIssues);
router.get('/:id', authenticate, getIssue);
// Pour créer: body { title, ..., sprintId }
router.post('/', authenticate, createIssueRules, handleValidation, createIssue);

// Separate route for delete action via POST with action
router.post('/:id/delete', authenticate, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const Issue = require('../models/issue');
    
    const issue = await Issue.findByPk(id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    await issue.destroy();
    return res.json({ message: 'Issue deleted successfully' });
  } catch (err) {
    console.error('Error deleting issue:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Regular PATCH route for updates only
router.patch('/:id', authenticate, handleValidation, updateIssue);

// Keep DELETE route as backup
router.delete('/:id', (req, res, next) => {
  console.log('DELETE route hit for ID:', req.params.id);
  next();
}, authenticate, deleteIssue);

module.exports = router;
