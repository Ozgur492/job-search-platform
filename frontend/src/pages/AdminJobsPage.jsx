import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { listJobs, deleteJob } from '../api';
import { Plus, Edit2, Trash2, Briefcase, MapPin, Clock, CheckCircle, XCircle } from 'lucide-react';
import { formatRelativeDate } from '../lib/date';
import './AdminJobsPage.css';

export default function AdminJobsPage() {
  const { user, loading: authLoading } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [toast, setToast] = useState(null);
  const [userRole, setUserRole] = useState(null);

  // Check role from token claims
  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem('firebaseToken');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserRole(payload.role || 'USER');
      } catch {
        setUserRole('USER');
      }
    }
  }, [user]);

  const fetchJobs = async (p = 0) => {
    setLoading(true);
    try {
      const res = await listJobs({ page: p, size: 50 });
      setJobs(res.data?.data || res.data?.content || []);
      setTotal(res.data?.total || res.data?.totalElements || 0);
      setPage(p);
    } catch (err) {
      console.error('Failed to fetch jobs', err);
      setJobs([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user && (userRole === 'ADMIN' || userRole === 'COMPANY')) {
      fetchJobs(0);
    }
  }, [user, userRole]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`"${title}" ilanını silmek istediğinizden emin misiniz?`)) return;
    try {
      await deleteJob(id);
      setJobs((prev) => prev.filter((j) => j.id !== id));
      setTotal((t) => t - 1);
      showToast('İlan silindi');
    } catch (err) {
      showToast(err.response?.data?.message || 'Silme işlemi başarısız', 'error');
    }
  };

  if (authLoading) return <div className="spinner" />;
  if (!user) return <Navigate to="/login?redirect=/admin/jobs" />;

  if (userRole && userRole !== 'ADMIN' && userRole !== 'COMPANY') {
    return (
      <div className="container admin-page">
        <div className="card empty-state">
          <XCircle size={48} style={{ color: 'var(--danger)' }} />
          <h3>Yetkiniz Yok</h3>
          <p>Bu sayfaya erişim izniniz bulunmamaktadır.</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: 16 }}>Ana Sayfa</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container admin-page">
      <div className="admin-header">
        <div>
          <h1><Briefcase size={28} /> İlan Yönetimi</h1>
          <p className="admin-subtitle">{total} ilan listeleniyor</p>
        </div>
        <Link to="/admin/jobs/new" className="btn btn-primary">
          <Plus size={18} /> Yeni İlan
        </Link>
      </div>

      {loading ? (
        <div className="spinner" />
      ) : jobs.length === 0 ? (
        <div className="card empty-state">
          <Briefcase size={48} />
          <h3>Henüz ilan yok</h3>
          <p>İlk ilanınızı oluşturun.</p>
          <Link to="/admin/jobs/new" className="btn btn-primary" style={{ marginTop: 16 }}>
            <Plus size={18} /> Yeni İlan
          </Link>
        </div>
      ) : (
        <>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Başlık</th>
                  <th>Şehir</th>
                  <th>Çalışma Şekli</th>
                  <th>İstihdam Türü</th>
                  <th>Durum</th>
                  <th>Yayın Tarihi</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id}>
                    <td>
                      <Link to={`/jobs/${job.id}`} className="admin-job-title">{job.title}</Link>
                    </td>
                    <td>
                      <span className="admin-cell-icon"><MapPin size={14} /> {job.city || '—'}</span>
                    </td>
                    <td>
                      <span className={`tag ${job.workPreference === 'REMOTE' ? 'tag-remote' : job.workPreference === 'HYBRID' ? 'tag-hybrid' : ''}`}>
                        {job.workPreference}
                      </span>
                    </td>
                    <td>{job.employmentType?.replace('_', ' ')}</td>
                    <td>
                      {job.isActive !== false ? (
                        <span className="status-badge status-active"><CheckCircle size={12} /> Aktif</span>
                      ) : (
                        <span className="status-badge status-inactive"><XCircle size={12} /> Pasif</span>
                      )}
                    </td>
                    <td>
                      <span className="admin-cell-icon"><Clock size={14} /> {formatRelativeDate(job.postedAt)}</span>
                    </td>
                    <td>
                      <div className="admin-actions">
                        <Link to={`/admin/jobs/${job.id}/edit`} className="btn btn-sm btn-secondary" title="Düzenle">
                          <Edit2 size={14} />
                        </Link>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(job.id, job.title)} title="Sil">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {total > 20 && (
            <div className="admin-pagination">
              {page > 0 && <button className="btn btn-secondary" onClick={() => fetchJobs(page - 1)}>Önceki</button>}
              <span style={{ color: 'var(--text-muted)', padding: '10px 0' }}>Sayfa {page + 1}</span>
              {(page + 1) * 50 < total && <button className="btn btn-secondary" onClick={() => fetchJobs(page + 1)}>Sonraki</button>}
            </div>
          )}
        </>
      )}

      {toast && (
        <div className={`toast toast-${toast.type}`}>{toast.msg}</div>
      )}
    </div>
  );
}
