import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import './AdminList.css'; // Shared styles

const AdminUserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/users'); // Ensure this endpoint exists or adjust to admin specific
            setUsers(response.data || []);
        } catch (err) {
            console.error('Error loading users:', err);
            setError('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="admin-container loading">Loading...</div>;

    return (
        <div className="admin-container">
            <h1 className="admin-title">User Management</h1>
            {error && <div className="error">{error}</div>}

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Joined</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user._id}>
                                <td>{user.fullName?.firstName} {user.fullName?.lastName}</td>
                                <td>{user.email}</td>
                                <td><span className={`badge role-${user.role}`}>{user.role}</span></td>
                                <td>{user.accountStatus}</td>
                                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <button className="btn-sm">View</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUserList;
