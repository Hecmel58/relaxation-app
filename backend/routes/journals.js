import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  res.json([
    { id: 1, title: 'My first journal', content: 'Today was great' },
    { id: 2, title: 'My second journal', content: 'Feeling calm and happy' }
  ]);
});

export default router;
