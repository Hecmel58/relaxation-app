const express = require('express');
const router = express.Router();
const passwordResetController = require('../controllers/passwordResetController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

router.post('/request-password-reset', passwordResetController.requestPasswordReset);

router.use(authenticateToken);
router.use(isAdmin);

router.get('/pending-requests', passwordResetController.getPendingRequests);
router.post('/approve', passwordResetController.approvePasswordReset);
router.post('/reject', passwordResetController.rejectPasswordReset);

module.exports = router;