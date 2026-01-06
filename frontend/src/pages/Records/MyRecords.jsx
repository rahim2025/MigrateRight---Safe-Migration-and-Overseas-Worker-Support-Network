import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useTranslation } from 'react-i18next';
import './MyRecords.css';

const MyRecords = () => {
    const { t } = useTranslation();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        documentType: 'other',
        notes: '',
        file: null,
    });
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchRecords();
    }, []);

    const fetchRecords = async () => {
        try {
            const res = await api.get('/work-records');
            setRecords(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, file: e.target.files[0] });
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.file) {
            setMessage({ type: 'error', text: 'Please select a file' });
            return;
        }

        setUploading(true);
        const data = new FormData();
        data.append('file', formData.file);
        data.append('title', formData.title);
        data.append('documentType', formData.documentType);
        data.append('notes', formData.notes);

        try {
            await api.post('/work-records', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setMessage({ type: 'success', text: 'Document uploaded successfully!' });
            setFormData({ title: '', documentType: 'other', notes: '', file: null });
            // Reset file input
            document.getElementById('file-upload').value = '';

            fetchRecords();
        } catch (err) {
            setMessage({ type: 'error', text: err.message || 'Upload failed' });
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this document?')) return;

        try {
            await api.delete(`/work-records/${id}`);
            const newRecords = records.filter((rec) => rec._id !== id);
            setRecords(newRecords);
        } catch (err) {
            alert('Delete failed');
        }
    };

    // Icon helper
    const getIcon = (type) => {
        switch (type) {
            case 'contract': return '📜';
            case 'visa': return '🛂';
            case 'passport': return '📘';
            case 'certificate': return '🎓';
            default: return '📁';
        }
    };

    return (
        <div className="records-page">
            <div className="records-container">
                <h1 className="page-title">📁 {t('records.title') || 'My Work Records'}</h1>

                {/* Upload Section */}
                <div className="upload-card">
                    <h2>Upload New Document</h2>
                    {message.text && (
                        <div className={`alert ${message.type === 'error' ? 'alert-danger' : 'alert-success'}`}>
                            {message.text}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="upload-form">
                        <div className="form-group">
                            <label>Document Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g. Employment Contract 2024"
                                required
                                className="form-input"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Type</label>
                                <select
                                    name="documentType"
                                    value={formData.documentType}
                                    onChange={handleChange}
                                    className="form-select"
                                >
                                    <option value="other">Other</option>
                                    <option value="contract">Contract</option>
                                    <option value="visa">Visa</option>
                                    <option value="passport">Passport</option>
                                    <option value="work_permit">Work Permit</option>
                                    <option value="insurance">Insurance</option>
                                    <option value="certificate">Certificate</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Select File</label>
                                <input
                                    type="file"
                                    id="file-upload"
                                    onChange={handleFileChange}
                                    className="file-input"
                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Notes (Optional)</label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                className="form-textarea"
                                rows="2"
                            ></textarea>
                        </div>

                        <button type="submit" className="btn-upload" disabled={uploading}>
                            {uploading ? 'Uploading...' : '☁️ Upload Document'}
                        </button>
                    </form>
                </div>

                {/* List Section */}
                <div className="records-list">
                    <h2>Your Archive ({records.length})</h2>
                    {loading ? (
                        <p className="loading-text">Loading records...</p>
                    ) : records.length === 0 ? (
                        <div className="empty-state">
                            <span className="empty-icon">📭</span>
                            <p>No documents found. Upload your important items to keep them safe.</p>
                        </div>
                    ) : (
                        <div className="records-grid">
                            {records.map((record) => (
                                <div key={record._id} className="record-card">
                                    <div className="record-icon">{getIcon(record.documentType)}</div>
                                    <div className="record-info">
                                        <h3>{record.title}</h3>
                                        <span className="record-meta">
                                            {new Date(record.uploadDate).toLocaleDateString()} • {record.documentType}
                                        </span>
                                        {record.notes && <p className="record-notes">{record.notes}</p>}
                                    </div>
                                    <div className="record-actions">
                                        <a
                                            href={`http://localhost:5000${record.fileUrl}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn-view"
                                        >
                                            👁️ View
                                        </a>
                                        <button
                                            onClick={() => handleDelete(record._id)}
                                            className="btn-delete"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyRecords;
