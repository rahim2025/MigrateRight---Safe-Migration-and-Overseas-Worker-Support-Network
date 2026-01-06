
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useTranslation } from 'react-i18next';
import './SalaryTracker.css';

const SalaryTracker = () => {
    const { t } = useTranslation();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        month: new Date().toLocaleString('default', { month: 'long' }),
        year: new Date().getFullYear(),
        promisedAmount: '',
        promisedCurrency: 'USD',
        receivedAmount: '',
        receivedCurrency: 'USD',
        status: 'pending',
        notes: '',
    });

    useEffect(() => {
        fetchRecords();
    }, []);

    const fetchRecords = async () => {
        try {
            const res = await api.get('/salary-records');
            setRecords(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Determine received date automatically if not set
            const payload = {
                ...formData,
                receivedDate: new Date(),
            };

            await api.post('/salary-records', payload);

            setFormData({
                month: new Date().toLocaleString('default', { month: 'long' }),
                year: new Date().getFullYear(),
                promisedAmount: '',
                promisedCurrency: 'USD',
                receivedAmount: '',
                receivedCurrency: 'USD',
                status: 'pending',
                notes: '',
            });
            fetchRecords();
        } catch (err) {
            alert(err.message || 'Error adding record');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this record?')) return;
        try {
            await api.delete(`/salary-records/${id}`);
            setRecords(records.filter(r => r._id !== id));
        } catch (err) {
            alert('Delete failed');
        }
    };

    // Helper to check discrepancy
    const hasDiscrepancy = (rec) => {
        // Simple check: if received < promised (assuming same currency for simplicity in UI)
        return rec.receivedAmount < rec.promisedAmount;
    };

    return (
        <div className="salary-page">
            <div className="salary-container">
                <h1 className="page-title">💰 {t('salary.title') || 'Salary Tracker'}</h1>

                {/* Add Form */}
                <div className="salary-form-card">
                    <h2>Log Monthly Payment</h2>
                    <form onSubmit={handleSubmit} className="salary-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Month</label>
                                <select name="month" value={formData.month} onChange={handleChange} className="form-select">
                                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Year</label>
                                <input type="number" name="year" value={formData.year} onChange={handleChange} className="form-input" />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Promised Amount</label>
                                <div className="input-group">
                                    <input
                                        type="number"
                                        name="promisedAmount"
                                        value={formData.promisedAmount}
                                        onChange={handleChange}
                                        className="form-input"
                                        required
                                    />
                                    <select name="promisedCurrency" value={formData.promisedCurrency} onChange={handleChange} className="currency-select">
                                        <option value="USD">USD</option>
                                        <option value="BDT">BDT</option>
                                        <option value="EUR">EUR</option>
                                        <option value="SAR">SAR</option>
                                        <option value="AED">AED</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Actually Received</label>
                                <div className="input-group">
                                    <input
                                        type="number"
                                        name="receivedAmount"
                                        value={formData.receivedAmount}
                                        onChange={handleChange}
                                        className="form-input"
                                        required
                                    />
                                    <select name="receivedCurrency" value={formData.receivedCurrency} onChange={handleChange} className="currency-select">
                                        <option value="USD">USD</option>
                                        <option value="BDT">BDT</option>
                                        <option value="EUR">EUR</option>
                                        <option value="SAR">SAR</option>
                                        <option value="AED">AED</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Status</label>
                                <select name="status" value={formData.status} onChange={handleChange} className="form-select">
                                    <option value="pending">Pending</option>
                                    <option value="paid">Full Payment</option>
                                    <option value="partial">Partial Payment</option>
                                    <option value="disputed">Disputed</option>
                                </select>
                            </div>
                        </div>

                        <button type="submit" className="btn-add">➕ Add Record</button>
                    </form>
                </div>

                {/* List */}
                <div className="salary-history">
                    <h2>Payment History</h2>
                    {loading ? <p>Loading...</p> : records.length === 0 ? (
                        <div className="empty-state">No salary records yet. Start tracking your earnings!</div>
                    ) : (
                        <div className="history-table-container">
                            <table className="history-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Promised</th>
                                        <th>Received</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {records.map(rec => (
                                        <tr key={rec._id} className={hasDiscrepancy(rec) ? 'row-warning' : ''}>
                                            <td>
                                                <strong>{rec.month} {rec.year}</strong><br />
                                                <span className="text-muted">{new Date(rec.createdAt).toLocaleDateString()}</span>
                                            </td>
                                            <td>{rec.promisedAmount} {rec.promisedCurrency}</td>
                                            <td className={hasDiscrepancy(rec) ? 'text-danger' : 'text-success'}>
                                                {rec.receivedAmount} {rec.receivedCurrency}
                                                {hasDiscrepancy(rec) && <span className="warning-icon" title="Less than promised">⚠️</span>}
                                            </td>
                                            <td>
                                                <span className={`badge badge - ${rec.status} `}>{rec.status}</span>
                                            </td>
                                            <td>
                                                <button onClick={() => handleDelete(rec._id)} className="btn-icon">🗑️</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SalaryTracker;
