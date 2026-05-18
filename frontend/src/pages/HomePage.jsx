import { useState, useEffect } from 'react';
import { searchJobs } from '../api';
import JobCard from '../components/JobCard';
import { Search, Briefcase } from 'lucide-react';

const WORK_PREFS = ['Tümü', 'REMOTE', 'ONSITE', 'HYBRID'];

export default function HomePage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [position, setPosition] = useState('');
  const [city, setCity] = useState('');
  const [activeFilter, setActiveFilter] = useState('Tümü');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  const fetchJobs = async (p = 0) => {
    setLoading(true);
    try {
      const params = { page: p, size: 20 };
      if (position) params.position = position;
      if (city) params.city = city;
      if (activeFilter !== 'Tümü') params.workPreference = activeFilter;
      const res = await searchJobs(params);
      setJobs(res.data?.data || []);
      setTotal(res.data?.total || 0);
      setPage(p);
    } catch (err) {
      console.error('Failed to fetch jobs', err);
      setJobs([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchJobs(0); }, [activeFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs(0);
  };

  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>Hayalindeki İşi Bul</h1>
          <p>Binlerce güncel iş ilanı arasından AI destekli arama ile sana en uygun kariyer fırsatını keşfet.</p>
          <form onSubmit={handleSearch} className="search-bar">
            <input
              id="search-position"
              type="text"
              placeholder="Pozisyon, anahtar kelime..."
              value={position}
              onChange={(e) => setPosition(e.target.value)}
            />
            <input
              id="search-city"
              type="text"
              placeholder="Şehir"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">
              <Search size={18} /> Ara
            </button>
          </form>
          <div className="filters">
            {WORK_PREFS.map((wp) => (
              <button
                key={wp}
                className={`filter-chip ${activeFilter === wp ? 'active' : ''}`}
                onClick={() => setActiveFilter(wp)}
              >
                {wp === 'Tümü' ? 'Tümü' : wp}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="container">
        {loading ? (
          <div className="spinner" />
        ) : jobs.length === 0 ? (
          <div className="empty-state">
            <Briefcase size={48} />
            <h3>İlan bulunamadı</h3>
            <p>Farklı anahtar kelimeler veya filtreler deneyin.</p>
          </div>
        ) : (
          <>
            <p style={{ color: 'var(--text-muted)', marginTop: 24, fontSize: '0.9rem' }}>
              {total} ilan bulundu
            </p>
            <div className="job-grid">
              {jobs.map((job) => <JobCard key={job.id} job={job} />)}
            </div>
            {total > 20 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12, margin: '32px 0' }}>
                {page > 0 && <button className="btn btn-secondary" onClick={() => fetchJobs(page - 1)}>Önceki</button>}
                <span style={{ color: 'var(--text-muted)', padding: '10px 0' }}>Sayfa {page + 1}</span>
                {(page + 1) * 20 < total && <button className="btn btn-secondary" onClick={() => fetchJobs(page + 1)}>Sonraki</button>}
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}
