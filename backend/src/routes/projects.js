const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const projectController = require('../controllers/projectController');
const statsController = require('../controllers/statsController');

router.post('/', auth, projectController.createProject);
router.get('/', auth, projectController.listProjects);
router.get('/:id/stats', auth, statsController.getProjectStats);
router.get('/:id/sprints', auth, projectController.getProjectSprints);
router.get('/:id/members', auth, projectController.getProjectMembers);
router.post('/:id/regenerate-code', auth, projectController.regenerateProjectCode);
router.delete('/:id/members/:userId', auth, projectController.removeMember);
router.get('/:id', auth, projectController.getProject);
router.post('/join', auth, projectController.joinProject);
router.patch('/:id/join-lock', auth, projectController.setJoinLock);
router.post('/:id/leave', auth, projectController.leaveProject);
router.patch('/:id', auth, projectController.updateProject);
router.delete('/:id', auth, projectController.deleteProject);

module.exports = router;
