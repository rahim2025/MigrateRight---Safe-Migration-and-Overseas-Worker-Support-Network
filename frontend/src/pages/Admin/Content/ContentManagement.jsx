import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { createArticle, fetchArticles } from '@services/contentService';
import './ContentManagement.css';

const ContentManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', summary: '', category: 'General', author: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isAdmin = user?.role === 'platform_admin' || user?.role === 'admin' || user?.role === 'recruitment_admin';

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchArticles();
        setArticles(data || []);
      } catch (err) {
        setError(err?.message || 'Failed to load articles');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const article = await createArticle({
        title: form.title,
        summary: form.summary,
        category: form.category,
        author: form.author || user?.fullName?.firstName || 'Admin',
      });
      setArticles((prev) => [article, ...prev]);
      setSuccess('Article published successfully');
      setForm({ title: '', summary: '', category: 'General', author: '' });
    } catch (err) {
      setError(err?.message || 'Failed to publish article');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="content-page">
        <h1>Content Management</h1>
        <p>You do not have permission to manage articles.</p>
        <button className="btn" onClick={() => navigate('/')}>Go Home</button>
      </div>
    );
  }

  return (
    <div className="content-page">
      <div className="content-header">
        <div>
          <p className="eyebrow">Content Management</p>
          <h1>Articles & News</h1>
          <p className="muted">Publish updates that all users can read from the Articles page.</p>
        </div>
        <button className="btn-secondary" onClick={() => navigate('/articles')}>View public page</button>
      </div>

      <div className="content-grid">
        <form className="content-card" onSubmit={handleSubmit}>
          <h2>Publish new article</h2>
          <label>
            Title
            <input name="title" value={form.title} onChange={handleChange} required />
          </label>
          <label>
            Summary
            <textarea name="summary" value={form.summary} onChange={handleChange} required rows={3} />
          </label>
          <label>
            Category
            <select name="category" value={form.category} onChange={handleChange}>
              <option>General</option>
              <option>Guides</option>
              <option>Safety</option>
              <option>Policy</option>
              <option>Platform</option>
            </select>
          </label>
          <label>
            Author (optional)
            <input name="author" value={form.author} onChange={handleChange} placeholder={user?.fullName?.firstName || 'Admin'} />
          </label>

          {error && <div className="alert error">{error}</div>}
          {success && <div className="alert success">{success}</div>}

          <button className="btn" type="submit" disabled={submitting}>
            {submitting ? 'Publishing…' : 'Publish'}
          </button>
        </form>

        <div className="content-card">
          <div className="list-header">
            <h2>Recent articles</h2>
            {loading && <span className="muted">Loading…</span>}
          </div>
          {!loading && !articles.length && <p className="muted">No articles yet.</p>}
          <ul className="article-list">
            {articles.map((a) => (
              <li key={a._id}>
                <div>
                  <p className="title">{a.title}</p>
                  <p className="muted small">{a.category} • {new Date(a.publishedAt).toLocaleDateString()}</p>
                  <p className="muted small">{a.summary}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ContentManagement;
