const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { createIssue, listIssues, getIssue, updateIssue, deleteIssue } = require('../controllers/issueController');
const { createIssueRules, handleValidation } = require('../validators/issueValidator');

router.get('/', listIssues);
router.get('/:id', getIssue);
router.post('/', auth, createIssueRules, handleValidation, createIssue);

// Separate route for delete action via POST with action
router.post('/:id/delete', auth, async (req, res) => {
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
router.patch('/:id', auth, handleValidation, updateIssue);

// Keep DELETE route as backup
router.delete('/:id', (req, res, next) => {
  console.log('DELETE route hit for ID:', req.params.id);
  next();
}, auth, deleteIssue);

module.exports = router;
