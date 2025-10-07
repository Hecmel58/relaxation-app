const express = require('express');
const router = express.Router();
const heartRateController = require('../controllers/heartRateController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.post('/sessions', heartRateController.createSession);
router.get('/sessions', heartRateController.getUserSessions);

module.exports = router;