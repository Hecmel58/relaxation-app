const express = require('express');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
    res.json([{ id: 1, text: 'Bugün iyi geçti', createdAt: new Date().toISOString() }]);
});

router.post('/', authenticate, async (req, res) => {
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ error: 'text gerekli' });
    res.status(201).json({ id: Date.now(), text, createdAt: new Date().toISOString() });
});

module.exports = router;