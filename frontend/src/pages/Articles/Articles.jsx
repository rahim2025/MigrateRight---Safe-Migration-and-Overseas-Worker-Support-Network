import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchArticles } from '@services/contentService';
import './Articles.css';

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const fallbackArticles = [
  {
    _id: 'sample-1',
    title: 'Welcome to the new Articles & News section',
    summary: 'Admins can publish safety updates, policy changes, and tips here. This placeholder will disappear once real posts arrive.',
    category: 'Platform',
    publishedAt: new Date().toISOString(),
  },
  {
    _id: 'sample-2',
    title: 'How to stay informed while working abroad',
    summary: 'Turn on notifications to get the latest guidance on contracts, salary tracking, and emergency contacts.',
    category: 'Guides',
    publishedAt: new Date().toISOString(),
  },
];

const Articles = () => {
  const { t } = useTranslation();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchArticles();
        if (Array.isArray(data) && data.length) {
          setArticles(data);
        } else {
          setArticles([]);
        }
      } catch (err) {
        setError(err?.message || t('errors.generic'));
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [t]);

  const itemsToRender = useMemo(() => {
    if (articles.length) return articles;
    if (loading) return [];
    return fallbackArticles;
  }, [articles, loading]);

  return (
    <div className="articles-page">
      <header className="articles-hero">
        <p className="eyebrow">{t('navigation.articles')}</p>
        <h1>{t('articles.title')}</h1>
        <p className="subtitle">{t('articles.subtitle')}</p>
      </header>

      {loading && <p className="status">{t('common.loading')}</p>}
      {error && !loading && <div className="status error">{error}</div>}

      {!loading && !articles.length && !error && (
        <div className="status muted">{t('articles.empty')}</div>
      )}

      <div className="articles-grid">
        {itemsToRender.map((article) => (
          <article className="article-card" key={article._id || article.id}>
            <div className="article-meta">
              {article.category && <span className="badge">{article.category}</span>}
              {article.publishedAt && (
                <span className="meta-text">{formatDate(article.publishedAt)}</span>
              )}
            </div>
            <h2>{article.title}</h2>
            {article.summary && <p className="summary">{article.summary}</p>}
            <div className="card-footer">
              {article.author && <span className="meta-text">{t('articles.by', { author: article.author })}</span>}
              <button type="button" className="text-button" disabled>
                {t('articles.readMore')}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default Articles;
