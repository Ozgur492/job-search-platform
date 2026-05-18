import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { User, Mail } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;

  return (
    <div className="container" style={{ padding: '40px 24px', maxWidth: 600 }}>
      <h1 style={{ marginBottom: 24 }}><User size={28} /> Profilim</h1>
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--gradient-hero)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700 }}>
            {user.email?.[0]?.toUpperCase()}
          </div>
          <div>
            <h3>{user.displayName || user.email?.split('@')[0]}</h3>
            <p style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Mail size={14} /> {user.email}
            </p>
          </div>
        </div>
        <p style={{ color: 'var(--text-secondary)' }}>UID: <code style={{ fontSize: '0.8rem' }}>{user.uid}</code></p>
      </div>
    </div>
  );
}
