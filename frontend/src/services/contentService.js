import api from './api';

// Content service for articles/news
export const fetchArticles = async () => {
  const response = await api.get('/content/articles');
  // Support either { articles: [] } or direct array responses
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.articles)) return response.articles;
  return [];
};

export const createArticle = async (payload) => {
  const response = await api.post('/content/articles', payload);
  // accept either { article } or raw article
  if (response?.article) return response.article;
  return response;
};

export default { fetchArticles, createArticle };
