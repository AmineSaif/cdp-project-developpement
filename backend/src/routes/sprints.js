const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const sprintController = require('../controllers/sprintController');

router.post('/', auth, sprintController.createSprint);
router.get('/', auth, sprintController.listSprints);
router.get('/:id', auth, sprintController.getSprint);
router.get('/:id/issues', auth, sprintController.getSprintIssues);
router.patch('/:id', auth, sprintController.updateSprint);
router.delete('/:id', auth, sprintController.deleteSprint);

module.exports = router;
