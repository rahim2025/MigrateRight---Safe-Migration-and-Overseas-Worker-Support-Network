const express = require('express');
const { getArticles, createArticle } = require('../controllers/content.controller');

const router = express.Router();

// Public: fetch articles/news
router.get('/articles', getArticles);

// Admin: create article/news (placeholder - should be secured in future)
router.post('/articles', createArticle);

module.exports = router;
