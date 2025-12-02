const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const clientController = require('../controllers/clientController');

router.post('/', authenticate, clientController.createClient);
router.get('/', authenticate, clientController.listMyClients);
router.get('/:id', authenticate, clientController.getClient);
router.patch('/:id', authenticate, clientController.updateClient);
router.delete('/:id', authenticate, clientController.deleteClient);

module.exports = router;
