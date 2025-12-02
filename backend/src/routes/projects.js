const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const projectController = require('../controllers/projectController');
const statsController = require('../controllers/statsController');

router.post('/', authenticate, projectController.createProject);
router.get('/', authenticate, projectController.listProjects);
router.get('/:id/stats', authenticate, statsController.getProjectStats);
router.get('/:id/members', authenticate, projectController.getProjectMembers);
router.post('/:id/regenerate-code', authenticate, projectController.regenerateProjectCode);
router.delete('/:id/members/:userId', authenticate, projectController.removeMember);
router.get('/:id', authenticate, projectController.getProject);
router.post('/join', authenticate, projectController.joinProject);
router.patch('/:id/join-lock', authenticate, projectController.setJoinLock);
router.post('/:id/leave', authenticate, projectController.leaveProject);
router.patch('/:id', authenticate, projectController.updateProject);
router.delete('/:id', authenticate, projectController.deleteProject);

module.exports = router;
