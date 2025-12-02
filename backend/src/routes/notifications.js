const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const notificationController = require('../controllers/notificationController');

router.get('/unread-count', authenticate, notificationController.getUnreadCount);
router.get('/', authenticate, notificationController.listNotifications);
router.patch('/read-all', authenticate, notificationController.markAllAsRead);
router.patch('/:id/read', authenticate, notificationController.markAsRead);
router.delete('/:id', authenticate, notificationController.deleteNotification);

module.exports = router;
