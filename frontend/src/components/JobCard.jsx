import { Link } from 'react-router-dom';
import { MapPin, Clock, Building2 } from 'lucide-react';

export default function JobCard({ job }) {
  const workTag = {
    REMOTE: 'tag tag-remote',
    HYBRID: 'tag tag-hybrid',
    ONSITE: 'tag',
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diffH = Math.floor((now - d) / 3600000);
    if (diffH < 1) return 'Az önce';
    if (diffH < 24) return `${diffH} saat önce`;
    const diffD = Math.floor(diffH / 24);
    if (diffD < 7) return `${diffD} gün önce`;
    return d.toLocaleDateString('tr-TR');
  };

  const formatSalary = (min, max, currency) => {
    if (!min && !max) return null;
    const fmt = (n) => n?.toLocaleString('tr-TR');
    const cur = currency || 'TRY';
    if (min && max) return `${fmt(min)} - ${fmt(max)} ${cur}`;
    if (min) return `${fmt(min)}+ ${cur}`;
    return `${fmt(max)} ${cur}`;
  };

  return (
    <Link to={`/jobs/${job.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="card job-card">
        <div>
          <h3>{job.title}</h3>
          <div className="job-meta">
            <span><Building2 size={14} /> {job.companyName}</span>
            <span><MapPin size={14} /> {job.city}, {job.country}</span>
            <span><Clock size={14} /> {formatDate(job.postedAt)}</span>
          </div>
          <div className="job-tags">
            <span className={workTag[job.workPreference] || 'tag'}>{job.workPreference}</span>
            <span className="tag">{job.employmentType?.replace('_', ' ')}</span>
            {job.positionLevel && <span className="tag">{job.positionLevel}</span>}
          </div>
        </div>
        {formatSalary(job.salaryMin, job.salaryMax, job.currency) && (
          <div className="salary">{formatSalary(job.salaryMin, job.salaryMax, job.currency)}</div>
        )}
      </div>
    </Link>
  );
}
