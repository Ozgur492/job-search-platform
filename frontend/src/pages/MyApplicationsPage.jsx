import { useState, useEffect, useMemo } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyApplications } from '../api';
import { formatRelativeDate } from '../lib/date';
import { Briefcase, MapPin, Clock, Search, Calendar, TrendingUp, ExternalLink } from 'lucide-react';
import './MyApplicationsPage.css';

const FILTERS = [
  { key: 'all', label: 'Tümü' },
  { key: '7d', label: 'Son 7 Gün' },
  { key: '30d', label: 'Son 30 Gün' },
];

export default function MyApplicationsPage() {
  const { user, loading: authLoading } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError(null);
    getMyApplications()
      .then((res) => setApplications(res.data?.data || []))
      .catch((err) => {
        console.error(err);
        setError('Başvurular yüklenirken hata oluştu.');
      })
      .finally(() => setLoading(false));
  }, [user]);

  const now = new Date();
  const stats = useMemo(() => {
    const total = applications.length;
    const last7 = applications.filter((a) => (now - new Date(a.appliedAt)) < 7 * 86400000).length;
    const last30 = applications.filter((a) => (now - new Date(a.appliedAt)) < 30 * 86400000).length;
    return { total, last7, last30 };
  }, [applications]);

  const filtered = useMemo(() => {
    if (activeFilter === '7d') return applications.filter((a) => (now - new Date(a.appliedAt)) < 7 * 86400000);
    if (activeFilter === '30d') return applications.filter((a) => (now - new Date(a.appliedAt)) < 30 * 86400000);
    return applications;
  }, [applications, activeFilter]);

  if (authLoading) return <div className="spinner" />;
  if (!user) return <Navigate to="/login?redirect=/me/applications" />;

  return (
    <div className="container applications-page">
      <h1><Briefcase size={28} /> Başvurularım</h1>

      {/* Stats Row */}
      <div className="stats-row">
        <div className="stat-card card">
          <TrendingUp size={20} className="stat-icon" />
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Toplam Başvuru</div>
        </div>
        <div className="stat-card card">
          <Calendar size={20} className="stat-icon" />
          <div className="stat-value">{stats.last7}</div>
          <div className="stat-label">Son 7 Gün</div>
        </div>
        <div className="stat-card card">
          <Calendar size={20} className="stat-icon" />
          <div className="stat-value">{stats.last30}</div>
          <div className="stat-label">Son 30 Gün</div>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="filters" style={{ justifyContent: 'flex-start', marginTop: 24, marginBottom: 24 }}>
        {FILTERS.map((f) => (
          <button key={f.key} className={`filter-chip ${activeFilter === f.key ? 'active' : ''}`}
            onClick={() => setActiveFilter(f.key)}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="skeleton-list">
          {[1, 2, 3].map((i) => <div key={i} className="card skeleton-card"><div className="skeleton-shimmer" /></div>)}
        </div>
      ) : error ? (
        <div className="card empty-state">
          <h3>{error}</h3>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => window.location.reload()}>Tekrar Dene</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card empty-state">
          <Briefcase size={48} />
          <h3>Henüz başvuru yapmadınız</h3>
          <p>İlanlara göz atarak ilk başvurunuzu yapın.</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: 16 }}>
            <Search size={16} /> İlanlara Göz At
          </Link>
        </div>
      ) : (
        <div className="applications-list">
          {filtered.map((app) => (
            <div key={app.id} className="card application-card">
              <div className="application-info">
                <h3>{app.jobTitle}</h3>
                <div className="job-meta">
                  {app.companyName && <span><Briefcase size={14} /> {app.companyName}</span>}
                  <span><MapPin size={14} /> {app.city}{app.country ? `, ${app.country}` : ''}</span>
                  {app.workPreference && (
                    <span className={`tag ${app.workPreference === 'REMOTE' ? 'tag-remote' : app.workPreference === 'HYBRID' ? 'tag-hybrid' : ''}`}>
                      {app.workPreference}
                    </span>
                  )}
                </div>
                <div className="application-date">
                  <Clock size={14} /> {formatRelativeDate(app.appliedAt)}
                </div>
              </div>
              <div className="application-actions">
                <Link to={`/jobs/${app.jobId}`} className="btn btn-sm btn-secondary">
                  <ExternalLink size={14} /> İlanı Gör
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
