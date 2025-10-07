const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.delete('/account', userController.deleteAccount);
router.get('/data/download', userController.downloadData);

module.exports = router;