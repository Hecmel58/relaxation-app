const express = require('express');
const router = express.Router();
const sleepController = require('../controllers/sleepController');
const { authenticateToken } = require('../middleware/auth');
const { validateSleepSession } = require('../validators/sleepValidator');

router.use(authenticateToken);

router.post('/sessions', validateSleepSession, sleepController.createSession);
router.get('/sessions', sleepController.getSessions);
router.get('/sessions/:id', sleepController.getSession);
router.delete('/sessions/:id', sleepController.deleteSession);
router.get('/analytics', sleepController.getAnalytics);

module.exports = router;