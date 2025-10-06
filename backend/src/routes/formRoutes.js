const express = require('express');
const router = express.Router();
const formController = require('../controllers/formController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/types', formController.getFormTypes);
router.post('/submit', formController.submitForm);
router.get('/list', formController.getUserForms);

module.exports = router;