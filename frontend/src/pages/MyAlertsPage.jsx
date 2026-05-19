import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyAlerts, createJobAlert, deleteAlert } from '../api';
import { formatRelativeDate } from '../lib/date';
import Modal from '../components/ui/Modal';
import { Bell, Plus, Trash2, MapPin, Tag, Clock, AlertCircle } from 'lucide-react';
import './MyAlertsPage.css';

export default function MyAlertsPage() {
  const { user, loading: authLoading } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);

  // Form state
  const [form, setForm] = useState({
    keywords: '', country: 'Türkiye', city: '', town: '', workPreference: '',
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchAlerts = () => {
    if (!user) return;
    setLoading(true);
    getMyAlerts()
      .then((res) => setAlerts(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAlerts(); }, [user]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.keywords.trim() || form.keywords.trim().length < 2) {
      setFormError('Anahtar kelime en az 2 karakter olmalıdır');
      return;
    }
    setFormError('');
    setSubmitting(true);
    try {
      const payload = {
        keywords: form.keywords.trim(),
        country: form.country || null,
        city: form.city || null,
        town: form.town || null,
        workPreference: form.workPreference || null,
      };
      await createJobAlert(payload);
      showToast('Alarm oluşturuldu — eşleşen ilanlar yayınlandığında bildirim alacaksınız');
      setShowModal(false);
      setForm({ keywords: '', country: 'Türkiye', city: '', town: '', workPreference: '' });
      fetchAlerts();
    } catch (err) {
      showToast(err.response?.data?.message || 'Alarm oluşturulamadı', 'error');
    }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu alarmı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) return;
    try {
      // Optimistic UI
      setAlerts((prev) => prev.filter((a) => a.id !== id));
      await deleteAlert(id);
      showToast('Alarm silindi');
    } catch (err) {
      showToast('Silme işlemi başarısız', 'error');
      fetchAlerts(); // revert
    }
  };

  const handleFormChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (formError) setFormError('');
  };

  if (authLoading) return <div className="spinner" />;
  if (!user) return <Navigate to="/login?redirect=/me/alerts" />;

  return (
    <div className="container alerts-page">
      <div className="alerts-header">
        <div>
          <h1><Bell size={28} /> İş Alarmlarım</h1>
          <p className="alerts-subtitle">Kriterlerinize uyan yeni ilanlar yayınlandığında bildirim alın.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Alarm Oluştur
        </button>
      </div>

      {loading ? (
        <div className="spinner" />
      ) : alerts.length === 0 ? (
        <div className="card empty-state">
          <Bell size={48} />
          <h3>Henüz alarm yok</h3>
          <p>İlk alarmınızı oluşturarak eşleşen ilanlardan haberdar olun.</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowModal(true)}>
            <Plus size={18} /> Alarm Oluştur
          </button>
        </div>
      ) : (
        <div className="alerts-list">
          {alerts.map((alert) => (
            <div key={alert.id} className="card alert-card">
              <div className="alert-info">
                <div className="alert-keywords">
                  {alert.keywords?.split(',').map((kw, i) => (
                    <span key={i} className="keyword-chip"><Tag size={12} /> {kw.trim()}</span>
                  ))}
                </div>
                <div className="alert-meta">
                  {(alert.country || alert.city || alert.town) && (
                    <span className="alert-location">
                      <MapPin size={14} />
                      {[alert.country, alert.city, alert.town].filter(Boolean).join(' / ')}
                    </span>
                  )}
                  {alert.workPreference && (
                    <span className={`tag ${alert.workPreference === 'REMOTE' ? 'tag-remote' : alert.workPreference === 'HYBRID' ? 'tag-hybrid' : ''}`}>
                      {alert.workPreference}
                    </span>
                  )}
                  <span className="alert-date">
                    <Clock size={14} /> {formatRelativeDate(alert.createdAt)}
                  </span>
                </div>
              </div>
              <button className="btn-icon btn-delete-alert" onClick={() => handleDelete(alert.id)} title="Sil">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create Alert Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Yeni Alarm Oluştur">
        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label htmlFor="alert-keywords">Anahtar Kelimeler *</label>
            <input id="alert-keywords" type="text" value={form.keywords} onChange={handleFormChange('keywords')}
              placeholder="Örn: React developer veya data engineer" maxLength={500}
              className={formError ? 'input-error' : ''} />
            {formError && <span className="field-error">{formError}</span>}
            <small className="form-help">Virgülle ayırarak birden fazla anahtar kelime girebilirsiniz.</small>
          </div>
          <div className="form-group">
            <label htmlFor="alert-country">Ülke</label>
            <input id="alert-country" type="text" value={form.country} onChange={handleFormChange('country')} />
          </div>
          <div className="form-row-modal">
            <div className="form-group">
              <label htmlFor="alert-city">Şehir</label>
              <input id="alert-city" type="text" value={form.city} onChange={handleFormChange('city')} placeholder="Örn: İzmir" />
            </div>
            <div className="form-group">
              <label htmlFor="alert-town">İlçe</label>
              <input id="alert-town" type="text" value={form.town} onChange={handleFormChange('town')} placeholder="Örn: Bornova" />
            </div>
          </div>
          <div className="form-group">
            <label>Çalışma Şekli</label>
            <div className="radio-group-modal">
              {['', 'ONSITE', 'REMOTE', 'HYBRID'].map((wp) => (
                <label key={wp} className={`radio-card ${form.workPreference === wp ? 'active' : ''}`}>
                  <input type="radio" name="alert-wp" value={wp} checked={form.workPreference === wp}
                    onChange={handleFormChange('workPreference')} />
                  <span>{wp || 'Hepsi'}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>İptal</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Oluşturuluyor...' : 'Alarm Oluştur'}
            </button>
          </div>
        </form>
      </Modal>

      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}
