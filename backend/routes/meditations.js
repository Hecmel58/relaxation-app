const express = require('express');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Örnek korumalı endpoint
router.get('/', authenticate, async (req, res) => {
    res.json([
        { id: 1, title: 'Deep Relax', duration: 10 },
        { id: 2, title: 'Calm Focus', duration: 15 }
    ]);
});

module.exports = router;