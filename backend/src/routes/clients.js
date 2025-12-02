const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const clientController = require('../controllers/clientController');

router.post('/', auth, clientController.createClient);
router.get('/', auth, clientController.listMyClients);
router.get('/:id', auth, clientController.getClient);
router.patch('/:id', auth, clientController.updateClient);
router.delete('/:id', auth, clientController.deleteClient);

module.exports = router;
