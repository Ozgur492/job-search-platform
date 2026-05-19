import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createJob, updateJob, getJob } from '../api';
import { ArrowLeft, Save, Loader } from 'lucide-react';
import './AdminJobFormPage.css';

const WORK_PREFS = ['ONSITE', 'REMOTE', 'HYBRID'];
const EMP_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN'];
const POS_LEVELS = ['', 'JUNIOR', 'MID', 'SENIOR', 'LEAD', 'EXPERT'];
const CURRENCIES = ['TRY', 'USD', 'EUR', 'GBP'];

const INITIAL = {
  title: '', department: '', description: '',
  country: 'Türkiye', city: '', town: '',
  workPreference: 'ONSITE', employmentType: 'FULL_TIME', positionLevel: '',
  salaryMin: '', salaryMax: '', currency: 'TRY',
  isActive: true, expiresAt: '',
};

export default function AdminJobFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [form, setForm] = useState({ ...INITIAL });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [loadingJob, setLoadingJob] = useState(isEdit);
  const [toast, setToast] = useState(null);
  const [notFound, setNotFound] = useState(false);

  // Role check
  const [userRole, setUserRole] = useState(null);
  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem('firebaseToken');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserRole(payload.role || 'USER');
      } catch { setUserRole('USER'); }
    }
  }, [user]);

  // Load job for edit mode
  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const res = await getJob(id);
        const j = res.data;
        setForm({
          title: j.title || '',
          department: j.department || '',
          description: j.description || '',
          country: j.country || 'Türkiye',
          city: j.city || '',
          town: j.town || '',
          workPreference: j.workPreference || 'ONSITE',
          employmentType: j.employmentType || 'FULL_TIME',
          positionLevel: j.positionLevel || '',
          salaryMin: j.salaryMin || '',
          salaryMax: j.salaryMax || '',
          currency: j.currency || 'TRY',
          isActive: j.isActive !== false,
          expiresAt: j.expiresAt ? j.expiresAt.split('T')[0] : '',
        });
      } catch (err) {
        if (err.response?.status === 404) setNotFound(true);
        else console.error(err);
      }
      setLoadingJob(false);
    })();
  }, [id, isEdit]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Başlık gereklidir';
    else if (form.title.length > 200) e.title = 'Başlık en fazla 200 karakter olabilir';
    if (!form.description.trim()) e.description = 'Açıklama gereklidir';
    else if (form.description.length < 50) e.description = 'Açıklama en az 50 karakter olmalı';
    else if (form.description.length > 5000) e.description = 'Açıklama en fazla 5000 karakter olabilir';
    if (!form.country.trim()) e.country = 'Ülke gereklidir';
    if (!form.city.trim()) e.city = 'Şehir gereklidir';
    if (!form.workPreference) e.workPreference = 'Çalışma şekli seçilmelidir';
    if (!form.employmentType) e.employmentType = 'İstihdam türü seçilmelidir';
    if (form.salaryMin && form.salaryMax && Number(form.salaryMin) > Number(form.salaryMax)) {
      e.salaryMax = 'Maksimum maaş, minimum maaştan büyük olmalı';
    }
    return e;
  };

  const handleChange = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    const payload = {
      ...form,
      salaryMin: form.salaryMin ? Number(form.salaryMin) : null,
      salaryMax: form.salaryMax ? Number(form.salaryMax) : null,
      positionLevel: form.positionLevel || null,
      town: form.town || null,
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
    };

    try {
      if (isEdit) {
        await updateJob(id, payload);
        showToast('İlan güncellendi');
      } else {
        await createJob(payload);
        showToast('İlan oluşturuldu');
      }
      setTimeout(() => navigate('/admin/jobs'), 500);
    } catch (err) {
      if (err.response?.status === 403) {
        showToast('Bu ilanı düzenleme yetkiniz yok', 'error');
      } else {
        showToast(err.response?.data?.message || 'İşlem başarısız', 'error');
      }
    }
    setSubmitting(false);
  };

  if (authLoading) return <div className="spinner" />;
  if (!user) return <Navigate to={`/login?redirect=/admin/jobs${isEdit ? `/${id}/edit` : '/new'}`} />;
  if (notFound) {
    return (
      <div className="container admin-form-page">
        <div className="card empty-state">
          <h3>İlan bulunamadı</h3>
          <Link to="/admin/jobs" className="btn btn-primary" style={{ marginTop: 16 }}>Geri dön</Link>
        </div>
      </div>
    );
  }
  if (loadingJob) return <div className="spinner" />;

  return (
    <div className="container admin-form-page">
      <Link to="/admin/jobs" className="back-link">
        <ArrowLeft size={16} /> İlan Yönetimine Dön
      </Link>

      <h1>{isEdit ? 'İlanı Düzenle' : 'Yeni İlan Oluştur'}</h1>

      <form onSubmit={handleSubmit} className="card admin-form">
        {/* Basic Info */}
        <div className="form-section">
          <h3 className="form-section-title">Temel Bilgiler</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="job-title">Başlık *</label>
              <input id="job-title" type="text" value={form.title} onChange={handleChange('title')} maxLength={200}
                className={errors.title ? 'input-error' : ''} placeholder="Örn: Senior React Developer" />
              {errors.title && <span className="field-error">{errors.title}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="job-department">Departman</label>
              <input id="job-department" type="text" value={form.department} onChange={handleChange('department')} placeholder="Örn: Engineering" />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="job-description">Açıklama *</label>
            <textarea id="job-description" value={form.description} onChange={handleChange('description')}
              rows={6} maxLength={5000} className={errors.description ? 'input-error' : ''}
              placeholder="İş tanımını detaylı bir şekilde yazın (min 50 karakter)..." />
            <div className="char-count">{form.description.length} / 5000</div>
            {errors.description && <span className="field-error">{errors.description}</span>}
          </div>
        </div>

        <div className="form-divider" />

        {/* Location */}
        <div className="form-section">
          <h3 className="form-section-title">Konum</h3>
          <div className="form-row form-row-3">
            <div className="form-group">
              <label htmlFor="job-country">Ülke *</label>
              <input id="job-country" type="text" value={form.country} onChange={handleChange('country')}
                className={errors.country ? 'input-error' : ''} />
              {errors.country && <span className="field-error">{errors.country}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="job-city">Şehir *</label>
              <input id="job-city" type="text" value={form.city} onChange={handleChange('city')}
                className={errors.city ? 'input-error' : ''} placeholder="Örn: İzmir" />
              {errors.city && <span className="field-error">{errors.city}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="job-town">İlçe</label>
              <input id="job-town" type="text" value={form.town} onChange={handleChange('town')} placeholder="Örn: Bornova" />
            </div>
          </div>
        </div>

        <div className="form-divider" />

        {/* Work Details */}
        <div className="form-section">
          <h3 className="form-section-title">Çalışma Detayları</h3>
          <div className="form-group">
            <label>Çalışma Şekli *</label>
            <div className="radio-group">
              {WORK_PREFS.map((wp) => (
                <label key={wp} className={`radio-card ${form.workPreference === wp ? 'active' : ''}`}>
                  <input type="radio" name="workPreference" value={wp} checked={form.workPreference === wp}
                    onChange={handleChange('workPreference')} />
                  <span>{wp}</span>
                </label>
              ))}
            </div>
            {errors.workPreference && <span className="field-error">{errors.workPreference}</span>}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="job-emptype">İstihdam Türü *</label>
              <select id="job-emptype" value={form.employmentType} onChange={handleChange('employmentType')}
                className={errors.employmentType ? 'input-error' : ''}>
                {EMP_TYPES.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
              </select>
              {errors.employmentType && <span className="field-error">{errors.employmentType}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="job-level">Pozisyon Seviyesi</label>
              <select id="job-level" value={form.positionLevel} onChange={handleChange('positionLevel')}>
                {POS_LEVELS.map((l) => <option key={l} value={l}>{l || '— Seçiniz —'}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="form-divider" />

        {/* Salary */}
        <div className="form-section">
          <h3 className="form-section-title">Maaş (isteğe bağlı)</h3>
          <div className="form-row form-row-3">
            <div className="form-group">
              <label htmlFor="job-salmin">Minimum Maaş</label>
              <input id="job-salmin" type="number" value={form.salaryMin} onChange={handleChange('salaryMin')} min={0} placeholder="0" />
            </div>
            <div className="form-group">
              <label htmlFor="job-salmax">Maksimum Maaş</label>
              <input id="job-salmax" type="number" value={form.salaryMax} onChange={handleChange('salaryMax')} min={0} placeholder="0"
                className={errors.salaryMax ? 'input-error' : ''} />
              {errors.salaryMax && <span className="field-error">{errors.salaryMax}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="job-currency">Para Birimi</label>
              <select id="job-currency" value={form.currency} onChange={handleChange('currency')}>
                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="form-divider" />

        {/* Visibility */}
        <div className="form-section">
          <h3 className="form-section-title">Görünürlük</h3>
          <div className="form-row">
            <div className="form-group">
              <label className="checkbox-label">
                <input type="checkbox" checked={form.isActive} onChange={handleChange('isActive')} />
                <span>Aktif (arama sonuçlarında görünür)</span>
              </label>
            </div>
            <div className="form-group">
              <label htmlFor="job-expires">Son Geçerlilik Tarihi</label>
              <input id="job-expires" type="date" value={form.expiresAt} onChange={handleChange('expiresAt')} />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/jobs')}>İptal</button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? <><Loader size={16} className="spin-icon" /> Kaydediliyor...</> : <><Save size={16} /> {isEdit ? 'Güncelle' : 'Oluştur'}</>}
          </button>
        </div>
      </form>

      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}
