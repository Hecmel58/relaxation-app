import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  res.json([
    { id: 1, title: 'Meditation 1', description: 'Relax and breathe' },
    { id: 2, title: 'Meditation 2', description: 'Focus and calm' }
  ]);
});

export default router;
