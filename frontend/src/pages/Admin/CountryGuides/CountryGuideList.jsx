import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as countryGuideService from '../../../services/countryGuideService';
import './CountryGuideList.css';

const AdminCountryGuideList = () => {
    const navigate = useNavigate();
    const [guides, setGuides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadGuides();
    }, []);

    const loadGuides = async () => {
        try {
            setLoading(true);
            // Fetch all guides without pagination for now, or add pagination later
            const response = await countryGuideService.getAllGuides({ limit: 100 });
            setGuides(response.data || []);
            setError(null);
        } catch (err) {
            console.error('Error loading guides:', err);
            setError('Failed to load country guides');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, countryName) => {
        if (window.confirm(`Are you sure you want to delete the guide for ${countryName}?`)) {
            try {
                await countryGuideService.deleteGuide(id);
                setGuides(guides.filter(guide => guide._id !== id));
            } catch (err) {
                console.error('Error deleting guide:', err);
                alert('Failed to delete guide');
            }
        }
    };

    if (loading) {
        return (
            <div className="admin-container">
                <div className="loading-spinner">Loading...</div>
            </div>
        );
    }

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h1>Country Guides Management</h1>
                <button
                    className="button-primary"
                    onClick={() => navigate('/admin/country-guides/new')}
                >
                    + Create New Guide
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Flag</th>
                            <th>Country</th>
                            <th>Region</th>
                            <th>Views</th>
                            <th>Status</th>
                            <th>Last Updated</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {guides.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="empty-state">
                                    No country guides found. Create one to get started.
                                </td>
                            </tr>
                        ) : (
                            guides.map((guide) => (
                                <tr key={guide._id}>
                                    <td className="flag-cell">{guide.flagEmoji}</td>
                                    <td>{guide.country}</td>
                                    <td>{guide.region}</td>
                                    <td>{guide.viewCount}</td>
                                    <td>
                                        <span debug-log={`isActive: ${guide.isActive}`} className={`status-badge ${guide.isActive ? 'status-active' : 'status-inactive'}`}>
                                            {guide.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>{new Date(guide.updatedAt).toLocaleDateString()}</td>
                                    <td className="actions-cell">
                                        <button
                                            className="action-btn edit-btn"
                                            title="Edit"
                                            onClick={() => navigate(`/admin/country-guides/edit/${guide._id}`)}
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            className="action-btn delete-btn"
                                            title="Delete"
                                            onClick={() => handleDelete(guide._id, guide.country)}
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminCountryGuideList;
