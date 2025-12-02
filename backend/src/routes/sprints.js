const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const sprintController = require('../controllers/sprintController');

router.post('/', authenticate, sprintController.createSprint);
router.get('/', authenticate, sprintController.listSprints);
router.get('/:id', authenticate, sprintController.getSprint);
router.patch('/:id', authenticate, sprintController.updateSprint);
router.delete('/:id', authenticate, sprintController.deleteSprint);

module.exports = router;
