const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

router.use(authenticateToken);
router.use(requireAdmin);

router.get('/users', adminController.getUsers);
router.get('/stats', adminController.getStats);
router.put('/users/:userId', adminController.updateUser);
router.delete('/users/:userId', adminController.deleteUser);
router.get('/sleep-data', adminController.getSleepData);
router.get('/sleep-history/:userId', adminController.getUserSleepHistory);
router.get('/form-responses', adminController.getFormResponses);

module.exports = router;