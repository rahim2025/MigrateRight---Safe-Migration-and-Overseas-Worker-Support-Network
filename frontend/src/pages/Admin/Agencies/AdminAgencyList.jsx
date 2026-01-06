import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../../services/api';
import '../Users/AdminList.css';

const AdminAgencyList = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const filterStatus = searchParams.get('status') || 'all';

    const [agencies, setAgencies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAgencies();
    }, [filterStatus]);

    const loadAgencies = async () => {
        setLoading(true);
        try {
            const endpoint = filterStatus === 'all'
                ? '/agencies'
                : `/agencies?adminApproval.status=${filterStatus}`;

            // Note: Adjust endpoint query params based on backend API capabilities if needed
            // For now assuming getAllAgencies supports status query
            const response = await api.get(endpoint);

            // Client-side filter fallback if API doesn't filter
            let data = response.data || [];
            if (filterStatus !== 'all') {
                data = data.filter(a => a.adminApproval?.status === filterStatus);
            }
            setAgencies(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = (status) => {
        setSearchParams(status === 'all' ? {} : { status });
    };

    const handleApprove = async (id) => {
        if (!window.confirm('Approve this agency?')) return;
        try {
            await api.patch(`/agencies/${id}/status`, { status: 'approved' }); // Verify endpoint
            loadAgencies();
        } catch (err) {
            alert('Failed to approve');
        }
    };

    return (
        <div className="admin-container">
            <h1 className="admin-title">Agency Management</h1>

            <div className="filter-bar">
                {['all', 'pending', 'approved', 'suspended', 'rejected'].map(status => (
                    <button
                        key={status}
                        className={`filter-btn ${filterStatus === status ? 'active' : ''}`}
                        onClick={() => handleFilter(status)}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                ))}
            </div>

            {loading ? <div>Loading...</div> : (
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Agency Name</th>
                                <th>License</th>
                                <th>Status</th>
                                <th>Applied Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {agencies.length === 0 && <tr><td colSpan="5" align="center">No agencies found</td></tr>}
                            {agencies.map(agency => (
                                <tr key={agency._id}>
                                    <td>
                                        <strong>{agency.agencyName}</strong><br />
                                        <span style={{ fontSize: '0.85rem', color: '#718096' }}>{agency.contactInfo?.primaryEmail}</span>
                                    </td>
                                    <td>{agency.registration?.licenseNumber}</td>
                                    <td>
                                        <span className={`badge status-${agency.adminApproval?.status}`}>
                                            {agency.adminApproval?.status}
                                        </span>
                                    </td>
                                    <td>{new Date(agency.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        {agency.adminApproval?.status === 'pending' && (
                                            <button className="btn-sm" style={{ color: 'green' }} onClick={() => handleApprove(agency._id)}>Approve</button>
                                        )}
                                        <button className="btn-sm" style={{ marginLeft: '0.5rem' }}>View</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminAgencyList;
