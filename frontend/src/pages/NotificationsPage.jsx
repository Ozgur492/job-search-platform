import { useState, useEffect } from 'react';
import { getMyNotifications, markNotificationRead } from '../api';
import { useAuth } from '../context/AuthContext';
import { Link, Navigate } from 'react-router-dom';
import { Bell, Briefcase, CheckCircle } from 'lucide-react';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getMyNotifications()
      .then((res) => setNotifications(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return <Navigate to="/login" />;
  if (loading) return <div className="spinner" />;

  const handleRead = async (id) => {
    await markNotificationRead(id);
    setNotifications((p) => p.map((n) => n._id === id ? { ...n, read: true } : n));
  };

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <h1 style={{ marginBottom: 24 }}><Bell size={28} /> Bildirimler</h1>
      {notifications.length === 0 ? (
        <div className="empty-state"><Bell size={48} /><h3>Henüz bildirim yok</h3></div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {notifications.map((n) => (
            <div key={n._id} className={`notification-item ${n.read ? '' : 'unread'}`}>
              <div className={`notification-dot ${n.read ? 'read' : ''}`} />
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{n.type === 'JOB_ALERT' ? 'İş Uyarısı' : 'Benzer İlan'}</span>
                <p><Link to={`/jobs/${n.jobId}`}>{n.jobTitle}</Link> {n.city && `— ${n.city}`}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{n.matchedReason}</p>
              </div>
              {!n.read && <button className="btn-icon" onClick={() => handleRead(n._id)}><CheckCircle size={16} /></button>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
