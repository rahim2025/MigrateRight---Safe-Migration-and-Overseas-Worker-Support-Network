import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../../services/api';
import '../Users/AdminList.css';

const AdminComplaintList = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const severityFilter = searchParams.get('severity');

    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadComplaints();
    }, [severityFilter]);

    const loadComplaints = async () => {
        setLoading(true);
        try {
            // Adjust endpoint to fetch complaints, potentially with filtering
            const response = await api.get('/agencies/complaints/all'); // Need to ensure this endpoint exists or create it
            // Client side filter for demo if API doesn't support query params yet
            let data = response.data || [];
            if (severityFilter) {
                // Approximate filtering
                if (severityFilter === 'high') data = data.filter(c => ['high', 'critical'].includes(c.severity));
            }
            setComplaints(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-container">
            <h1 className="admin-title">Complaints</h1>
            {/* Add Filters here later */}

            {loading ? <div>Loading...</div> : (
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Subject</th>
                                <th>Agency</th>
                                <th>Severity</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {complaints.length === 0 && <tr><td colSpan="6" align="center">No complaints found</td></tr>}
                            {complaints.map(c => (
                                <tr key={c._id}>
                                    <td>{c.trackingNumber || c._id.substr(-6)}</td>
                                    <td>{c.complaintType}</td>
                                    <td>{c.agencyId?.agencyName || 'Unknown'}</td>
                                    <td>
                                        <span className={`badge`} style={{
                                            backgroundColor: c.severity === 'critical' ? '#fed7d7' : c.severity === 'high' ? '#feebc8' : '#e2e8f0',
                                            color: c.severity === 'critical' ? '#c53030' : c.severity === 'high' ? '#c05621' : '#4a5568'
                                        }}>
                                            {c.severity}
                                        </span>
                                    </td>
                                    <td>{c.status}</td>
                                    <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminComplaintList;
