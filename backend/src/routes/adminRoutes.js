const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const heartRateController = require('../controllers/heartRateController');
const passwordResetController = require('../controllers/passwordResetController');
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
router.get('/heart-rate-data', heartRateController.getAllSessions);
router.get('/heart-rate-history/:userId', heartRateController.getUserHistory);

router.get('/password-reset-requests', passwordResetController.getPendingRequests);
router.post('/password-reset/approve', passwordResetController.approvePasswordReset);
router.post('/password-reset/reject', passwordResetController.rejectPasswordReset);

module.exports = router;