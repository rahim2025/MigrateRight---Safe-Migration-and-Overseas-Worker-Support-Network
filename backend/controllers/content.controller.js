const logger = require('../utils/logger');

// Temporary in-memory articles until CMS is ready
const articles = [
  {
    _id: 'seed-1',
    title: 'Welcome to MigrateRight Articles',
    summary:
      'Platform admins can publish general news, safety updates, and guidance here. This sample will be replaced once real posts are created.',
    category: 'Platform',
    author: 'MigrateRight Team',
    publishedAt: new Date().toISOString(),
  },
  {
    _id: 'seed-2',
    title: 'Staying informed while working abroad',
    summary:
      'Turn on notifications to receive important alerts about policy changes, salary rights, and emergency contacts.',
    category: 'Guides',
    author: 'Support Desk',
    publishedAt: new Date().toISOString(),
  },
];

/**
 * GET /api/content/articles
 * Returns latest articles/news. Currently returns sample data until CMS backend is implemented.
 */
const getArticles = async (req, res, next) => {
  try {
    // TODO: replace with database-backed content once CMS is built
    logger.info('Serving sample articles feed');
    return res.json({ articles });
  } catch (error) {
    logger.error('Failed to fetch articles', { message: error.message, stack: error.stack });
    return next(error);
  }
};

/**
 * POST /api/content/articles
 * Create a new article (temporary in-memory store).
 */
const createArticle = async (req, res, next) => {
  try {
    const { title, summary, category = 'General', content = '', author = 'Admin' } = req.body;

    if (!title || !summary) {
      return res.status(400).json({ message: 'Title and summary are required.' });
    }

    const article = {
      _id: `art-${Date.now()}`,
      title,
      summary,
      category,
      content,
      author,
      publishedAt: new Date().toISOString(),
    };

    // Push to in-memory list (placeholder for DB persist)
    articles.unshift(article);

    logger.info('Article created', { id: article._id, title: article.title });
    return res.status(201).json({ article });
  } catch (error) {
    logger.error('Failed to create article', { message: error.message, stack: error.stack });
    return next(error);
  }
};

module.exports = { getArticles, createArticle };
