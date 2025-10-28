const express = require('express');
const router = express.Router();
const heartRateController = require('../controllers/heartRateController');
const { authenticateToken } = require('../middleware/auth');
const { validateHeartRateSession } = require('../validators/heartRateValidator');

router.use(authenticateToken);

router.post('/sessions', validateHeartRateSession, heartRateController.createSession);
router.get('/sessions', heartRateController.getUserSessions);

module.exports = router;