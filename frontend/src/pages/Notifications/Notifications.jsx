import { useEffect, useState, useCallback } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useSocket } from '../../context/SocketContext';
import notificationService from '../../services/notificationService';
import NotificationsFeed from '../WorkerDashboard/components/NotificationsFeed';
import './Notifications.css';

const Notifications = () => {
  const { language } = useLanguage();
  const { socket, connected: socketConnected } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await notificationService.getNotifications(30, false);
      const list = res.data || res.notifications || res?.data?.data || res || [];
      setNotifications(Array.isArray(list.data) ? list.data : Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDismiss = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => (n._id || n.id) !== id));
    } catch (err) {
      console.error('Failed to delete notification', err);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) => prev.map((n) => ((n._id || n.id) === id ? { ...n, read: true } : n)));
    } catch (err) {
      console.error('Failed to mark notification read', err);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    if (!socket || !socketConnected) return;
    const handleNewNotification = (notification) => {
      setNotifications((prev) => [{ ...notification, read: false }, ...prev]);
    };
    socket.on('new_notification', handleNewNotification);
    return () => socket.off('new_notification', handleNewNotification);
  }, [socket, socketConnected]);

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <div>
          <h1>Notifications</h1>
          <p>Stay updated on SOS alerts, messages, and account activity.</p>
        </div>
        <div className="notifications-actions">
          <button className="btn btn-secondary" onClick={loadNotifications} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            className="btn btn-primary"
            onClick={async () => {
              await notificationService.markAllAsRead();
              setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
            }}
          >
            Mark all as read
          </button>
        </div>
      </div>

      <NotificationsFeed
        notifications={notifications}
        loading={loading}
        error={error}
        onDismiss={handleDismiss}
        onRetry={loadNotifications}
        language={language}
      />
    </div>
  );
};

export default Notifications;
