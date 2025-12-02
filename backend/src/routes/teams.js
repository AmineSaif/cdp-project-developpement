const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Legacy team routes (deprecated - use Projects instead)
router.get('/', authController.authenticate, async (req, res) => {
  try {
    const { Team } = require('../models');
    const teams = await Team.findAll({ where: { createdById: req.user.id } });
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

router.post('/', authController.authenticate, async (req, res) => {
  try {
    const { Team } = require('../models');
    const { name, description } = req.body;
    const team = await Team.create({ name, description, createdById: req.user.id });
    res.status(201).json(team);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

module.exports = router;
