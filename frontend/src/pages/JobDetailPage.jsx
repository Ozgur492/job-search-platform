import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getJob, getRelatedJobs, getApplicationCount, applyToJob } from '../api';
import { useAuth } from '../context/AuthContext';
import JobCard from '../components/JobCard';
import { MapPin, Building2, Clock, DollarSign, Users, ArrowLeft, CheckCircle } from 'lucide-react';

export default function JobDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [related, setRelated] = useState([]);
  const [appCount, setAppCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState(false);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [jobRes, relRes, countRes] = await Promise.all([
          getJob(id),
          getRelatedJobs(id).catch(() => ({ data: [] })),
          getApplicationCount(id).catch(() => ({ data: { count: 0 } })),
        ]);
        setJob(jobRes.data);
        setRelated(relRes.data || []);
        setAppCount(countRes.data?.count || 0);
      } catch (err) { console.error(err); }
      setLoading(false);
    }
    load();
  }, [id]);

  const handleApply = async () => {
    if (!user) return alert('Başvuru yapmak için giriş yapmalısınız.');
    setApplying(true);
    try {
      await applyToJob(id);
      setApplied(true);
      setAppCount((c) => c + 1);
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Başvuru sırasında hata oluştu.');
    }
    setApplying(false);
  };

  if (loading) return <div className="spinner" />;
  if (!job) return <div className="empty-state"><h3>İlan bulunamadı</h3></div>;

  return (
    <>
      <div className="job-detail-header">
        <div className="container">
          <Link to="/" style={{ color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 16 }}>
            <ArrowLeft size={16} /> Geri dön
          </Link>
          <h1>{job.title}</h1>
          <div className="job-meta" style={{ marginTop: 8 }}>
            <span><Building2 size={16} /> {job.companyName}</span>
            <span><MapPin size={16} /> {job.city}, {job.country}</span>
            <span><Users size={16} /> {appCount} başvuru</span>
          </div>
          <div className="job-tags" style={{ marginTop: 16 }}>
            <span className="tag">{job.workPreference}</span>
            <span className="tag">{job.employmentType?.replace('_', ' ')}</span>
            {job.positionLevel && <span className="tag">{job.positionLevel}</span>}
          </div>
        </div>
      </div>

      <div className="container">
        <div className="job-detail-body">
          <div>
            <h2 style={{ marginBottom: 16 }}>İş Tanımı</h2>
            <div className="job-description" style={{ whiteSpace: 'pre-wrap' }}>{job.description}</div>

            {related.length > 0 && (
              <div style={{ marginTop: 48 }}>
                <h3 style={{ marginBottom: 16 }}>Benzer İlanlar</h3>
                <div className="job-grid">{related.map((r) => <JobCard key={r.id} job={r} />)}</div>
              </div>
            )}
          </div>

          <div className="job-sidebar">
            <div className="card">
              {job.salaryMin || job.salaryMax ? (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 4 }}>
                    <DollarSign size={14} style={{ verticalAlign: 'middle' }} /> Maaş
                  </div>
                  <div className="salary" style={{ fontSize: '1.2rem' }}>
                    {job.salaryMin?.toLocaleString('tr-TR')} - {job.salaryMax?.toLocaleString('tr-TR')} {job.currency}
                  </div>
                </div>
              ) : null}

              {applied ? (
                <button className="btn btn-primary" disabled style={{ width: '100%', opacity: 0.7 }}>
                  <CheckCircle size={18} /> Başvuruldu
                </button>
              ) : (
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleApply} disabled={applying}>
                  {applying ? 'Başvuruluyor...' : 'Hemen Başvur'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
