import React, { useState, useEffect } from 'react';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats } from '../../../services/dashboardService';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        counts: {
            users: 0,
            agencies: 0,
            complaints: 0,
            agenciesActive: 0,
            agenciesPending: 0,
            agenciesSuspended: 0,
            complaintsUrgent: 0,
            complaintsOpen: 0
        },
        activity: [],
        charts: {
            userGrowth: [],
            agencyDist: [],
            complaintData: []
        }
    });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await getDashboardStats();
            if (response.success) {
                setStats(response.data);
            }
        } catch (err) {
            setError('Failed to load dashboard data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="dashboard-container"><div className="loading">Loading Dashboard...</div></div>;
    if (error) return <div className="dashboard-container"><div className="error">{error}</div></div>;

    const { counts, activity, charts } = stats;
    // Mock engagement data (static for now as backend doesn't support it yet)
    const engagementData = [
        { name: 'Mon', views: 0, chats: 0 },
        { name: 'Tue', views: 0, chats: 0 },
        { name: 'Wed', views: 0, chats: 0 },
        { name: 'Thu', views: 0, chats: 0 },
        { name: 'Fri', views: 0, chats: 0 },
        { name: 'Sat', views: 0, chats: 0 },
        { name: 'Sun', views: 0, chats: 0 },
    ];


    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Admin Dashboard</h1>
                <p>Overview of MigrateRight platform performance</p>
            </div>

            {/* Row 1: Core Metrics */}
            <div className="dashboard-row grid-4">
                {/* Card 1: Total Users */}
                <div className="dashboard-card">
                    <div>
                        <div className="metric-header">
                            <span className="metric-title">Total Users</span>
                            <span className="metric-icon">👥</span>
                        </div>
                        <div className="metric-value">{counts.users?.toLocaleString()}</div>
                        <div className="metric-trend trend-up">
                            {/* Trend logic requires historical data, keeping static placeholder or removing if misleading */}
                            <span style={{ color: '#718096', fontWeight: 'normal', fontSize: '0.8rem' }}>Total Registered</span>
                        </div>
                        {/* Mini graph placeholder using Recharts Area for sparkline effect */}
                        <div style={{ width: '100%', height: '50px', marginTop: '10px' }}>
                            <ResponsiveContainer>
                                <AreaChart data={charts.userGrowth}>
                                    <Area type="monotone" dataKey="users" stroke="#38a169" fill="#c6f6d5" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="card-action">
                        <button className="btn-link" onClick={() => navigate('/admin/users')}>View All Users</button>
                    </div>
                </div>

                {/* Card 2: Total Agencies */}
                <div className="dashboard-card">
                    <div>
                        <div className="metric-header">
                            <span className="metric-title">Total Agencies</span>
                            <span className="metric-icon">🏢</span>
                        </div>
                        <div className="metric-value">{counts.agencies}</div>
                        <div className="breakdown-list">
                            <div className="breakdown-item">
                                <span><span className="badge-dot bg-green"></span>Active</span>
                                <span>{counts.agenciesActive}</span>
                            </div>
                            <div className="breakdown-item">
                                <span><span className="badge-dot bg-yellow"></span>Pending</span>
                                <span>{counts.agenciesPending}</span>
                            </div>
                            <div className="breakdown-item">
                                <span><span className="badge-dot bg-red"></span>Suspended</span>
                                <span>{counts.agenciesSuspended}</span>
                            </div>
                        </div>
                    </div>
                    <div className="card-action">
                        <button className="btn-link" onClick={() => navigate('/admin/agencies?status=pending')}>View Pending Approvals</button>
                    </div>
                </div>

                {/* Card 3: Active Complaints */}
                <div className="dashboard-card">
                    <div>
                        <div className="metric-header">
                            <span className="metric-title">Active Complaints</span>
                            <span className="metric-icon">⚠️</span>
                        </div>
                        <div className="metric-value">{counts.complaints}</div>
                        <div className="breakdown-list">
                            <div className="breakdown-item">
                                <span><span className="badge-dot bg-red"></span>Urgent</span>
                                <span>{counts.complaintsUrgent}</span>
                            </div>
                            <div className="breakdown-item">
                                <span><span className="badge-dot bg-yellow"></span>Open</span>
                                <span>{counts.complaintsOpen}</span>
                            </div>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#718096', marginTop: '0.5rem' }}>
                            {/* Avg time logic needs backend implementation */}
                        </div>
                    </div>
                    <div className="card-action">
                        <button className="btn-link" onClick={() => navigate('/admin/complaints')}>View Complaints</button>
                    </div>
                </div>

                {/* Card 4: Platform Activity */}
                <div className="dashboard-card">
                    <div>
                        <div className="metric-header">
                            <span className="metric-title">Activity (Today)</span>
                            <span className="metric-icon">⚡</span>
                        </div>
                        <div className="breakdown-list" style={{ marginTop: '0.5rem' }}>
                            <div className="breakdown-item">
                                <span>New Registrations</span>
                                <strong>127</strong>
                            </div>
                            <div className="breakdown-item">
                                <span>Agency Applications</span>
                                <strong>3</strong>
                            </div>
                            <div className="breakdown-item">
                                <span>Messages Sent</span>
                                <strong>4,582</strong>
                            </div>
                            <div className="breakdown-item">
                                <span>Success Stories</span>
                                <strong>12</strong>
                            </div>
                        </div>
                    </div>
                    <div className="card-action">
                        <button className="btn-link">View Reports</button>
                    </div>
                </div>
            </div>

            {/* Row 2: Management & Quick Actions */}
            <div className="dashboard-row grid-2">
                <div className="dashboard-card management-card" onClick={() => navigate('/admin/country-guides')} style={{ cursor: 'pointer', borderLeft: '4px solid #3182ce' }}>
                    <div className="action-content">
                        <div className="metric-header">
                            <span className="metric-title">Content Management</span>
                            <span className="metric-icon">🌍</span>
                        </div>
                        <h2 style={{ fontSize: '1.4rem', margin: '0.5rem 0' }}>Country Guides</h2>
                        <p style={{ color: '#718096' }}>Manage destination guides, safety rules, and local laws.</p>
                        <button className="btn-link" style={{ marginTop: '1rem' }}>Manage Guides →</button>
                    </div>
                </div>

                <div className="dashboard-card management-card" onClick={() => navigate('/admin/content')} style={{ cursor: 'pointer', borderLeft: '4px solid #4a5568' }}>
                    <div className="action-content">
                        <div className="metric-header">
                            <span className="metric-title">Content Management</span>
                            <span className="metric-icon">📰</span>
                        </div>
                        <h2 style={{ fontSize: '1.4rem', margin: '0.5rem 0' }}>General & News</h2>
                        <p style={{ color: '#718096' }}>Publish articles, news, and safety updates.</p>
                        <button className="btn-link" style={{ marginTop: '1rem' }}>Manage Articles →</button>
                    </div>
                </div>
            </div>

            {/* Row 3: Pending Actions */}
            <h2 className="section-header">Action Required</h2>
            <div className="dashboard-row grid-4">
                <div className="dashboard-card action-card">
                    <div className="action-icon icon-orange">⏳</div>
                    <div className="action-content">
                        <span className="action-title">Pending Agencies</span>
                        <span className="action-meta">{counts.agenciesPending} awaiting approval</span>
                        <div style={{ fontSize: '0.8rem', color: '#e53e3e', marginBottom: '0.5rem' }}>Action required</div>
                        <button className="btn-action btn-urgent" onClick={() => navigate('/admin/agencies?status=pending')}>Review Now</button>
                    </div>
                </div>

                <div className="dashboard-card action-card">
                    <div className="action-icon icon-red">🚩</div>
                    <div className="action-content">
                        <span className="action-title">Flagged Content</span>
                        <span className="action-meta">12 reviews flagged</span>
                        <div style={{ fontSize: '0.8rem', color: '#718096', marginBottom: '0.5rem' }}>Spam (7), Fake (2)</div>
                        <button className="btn-action btn-neutral">Moderate</button>
                    </div>
                </div>

                <div className="dashboard-card action-card">
                    <div className="action-icon icon-red">⚠️</div>
                    <div className="action-content">
                        <span className="action-title">Urgent Complaints</span>
                        <span className="action-meta">{counts.complaintsUrgent} marked urgent</span>
                        <div style={{ fontSize: '0.8rem', color: '#dd6b20', marginBottom: '0.5rem' }}>High priority</div>
                        <button className="btn-action btn-urgent" onClick={() => navigate('/admin/complaints?severity=high')}>Handle</button>
                    </div>
                </div>

                <div className="dashboard-card action-card">
                    <div className="action-icon icon-purple">🔔</div>
                    <div className="action-content">
                        <span className="action-title">System Status</span>
                        <div style={{ fontSize: '0.85rem', marginBottom: '0.2rem' }}>Server: ✅ Good</div>
                        <div style={{ fontSize: '0.85rem', marginBottom: '0.2rem' }}>Backup: ✅ 2h ago</div>
                        <div style={{ fontSize: '0.85rem', color: '#dd6b20' }}>Failed logins: 45</div>
                    </div>
                </div>
            </div>

            {/* Row 3: Charts */}
            <div className="dashboard-row grid-2">
                <div className="dashboard-card">
                    <h3 className="chart-title">User Growth (Last 12 Months)</h3>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={charts.userGrowth}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Line type="monotone" dataKey="users" stroke="#3182ce" strokeWidth={3} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="dashboard-card">
                    <h3 className="chart-title">Agency Distribution by District</h3>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={charts.agencyDist}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#3182ce" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="dashboard-row grid-2">
                <div className="dashboard-card">
                    <h3 className="chart-title">Complaint Categories</h3>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={charts.complaintData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {charts.complaintData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="dashboard-card">
                    <h3 className="chart-title">Platform Engagement (This Week)</h3>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={engagementData}>
                                <defs>
                                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Area type="monotone" dataKey="views" stroke="#8884d8" fillOpacity={1} fill="url(#colorViews)" />
                                <Area type="monotone" dataKey="chats" stroke="#82ca9d" fill="#82ca9d" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Row 4: Recent Activity */}
            <h2 className="section-header">Live Activity Stream</h2>
            <div className="dashboard-card">
                <div className="feed-list">
                    {activity.length === 0 ? (
                        <div style={{ padding: '1rem', color: '#718096', textAlign: 'center' }}>No recent activity</div>
                    ) : (
                        activity.map((item, index) => (
                            <div key={index} className="feed-item">
                                <div className="feed-icon">{item.icon}</div>
                                <div className="feed-content">
                                    <div className="feed-message">
                                        {item.text}
                                    </div>
                                    <div className="feed-time">{new Date(item.time).toLocaleString()}</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <div className="card-action" style={{ textAlign: 'center' }}>
                    <button className="btn-link">View All Activity</button>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
