const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/auth');

router.use(requireAdmin);

router.get('/users', adminController.getUsers);
router.get('/stats', adminController.getStats);
router.get('/sleep-data', adminController.getSleepData);
router.get('/sleep-history/:userId', adminController.getUserSleepHistory);
router.post('/users', adminController.createUser);
router.put('/users/:userId', adminController.updateUser);
router.delete('/users/:userId', adminController.deleteUser);

module.exports = router;