const express = require('express');
const AnimeList = require('../models/AnimeList');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET /api/list - Get all user's list entries
router.get('/', async (req, res) => {
  try {
    const { status, favorite } = req.query;
    const filter = { userId: req.user._id };
    if (status) filter.status = status;
    if (favorite === 'true') filter.favorite = true;
    const list = await AnimeList.find(filter).sort({ updatedAt: -1 });
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/list/stats - Get user stats
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user._id;
    const [total, watched, watching, planToWatch, favorites, ratingData] = await Promise.all([
      AnimeList.countDocuments({ userId }),
      AnimeList.countDocuments({ userId, status: 'visto' }),
      AnimeList.countDocuments({ userId, status: 'viendo' }),
      AnimeList.countDocuments({ userId, status: 'por_ver' }),
      AnimeList.countDocuments({ userId, favorite: true }),
      AnimeList.aggregate([
        { $match: { userId, rating: { $ne: null } } },
        { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
      ]),
    ]);
    res.json({
      total,
      watched,
      watching,
      planToWatch,
      favorites,
      avgRating: ratingData[0] ? Math.round(ratingData[0].avg * 10) / 10 : 0,
      ratedCount: ratingData[0] ? ratingData[0].count : 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/list/:animeId - Get specific anime entry
router.get('/:animeId', async (req, res) => {
  try {
    const entry = await AnimeList.findOne({
      userId: req.user._id,
      animeId: parseInt(req.params.animeId),
    });
    if (!entry) return res.status(404).json({ message: 'Not found' });
    res.json(entry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/list - Add anime to list
router.post('/', async (req, res) => {
  try {
    const { animeId, status, rating, review, favorite } = req.body;
    if (!animeId || !status) {
      return res.status(400).json({ message: 'animeId and status are required' });
    }
    const existing = await AnimeList.findOne({ userId: req.user._id, animeId });
    if (existing) {
      return res.status(400).json({ message: 'Anime already in list. Use PUT to update.' });
    }
    const entry = await AnimeList.create({
      userId: req.user._id,
      animeId,
      status,
      rating: rating || null,
      review: review || '',
      favorite: favorite || false,
    });
    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/list/:animeId - Update anime entry
router.put('/:animeId', async (req, res) => {
  try {
    const { status, rating, review, favorite } = req.body;
    const entry = await AnimeList.findOneAndUpdate(
      { userId: req.user._id, animeId: parseInt(req.params.animeId) },
      { status, rating, review, favorite },
      { new: true, runValidators: true }
    );
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    res.json(entry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/list/:animeId - Remove anime from list
router.delete('/:animeId', async (req, res) => {
  try {
    const entry = await AnimeList.findOneAndDelete({
      userId: req.user._id,
      animeId: parseInt(req.params.animeId),
    });
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    res.json({ message: 'Removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
