const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { getTeamMembers, getMyTeam } = require('../controllers/teamController');

router.get('/members', auth, getTeamMembers);
router.get('/my-team', auth, getMyTeam);

module.exports = router;
