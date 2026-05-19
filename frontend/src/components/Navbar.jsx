import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, MessageCircle, LogOut, User, Shield, Briefcase, BellRing } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    if (!user) { setUserRole(null); return; }
    const token = localStorage.getItem('firebaseToken');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserRole(payload.role || 'USER');
      } catch { setUserRole('USER'); }
    }
  }, [user]);

  const isActive = (path) => location.pathname === path ? 'active' : '';
  const startsWith = (path) => location.pathname.startsWith(path) ? 'active' : '';

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="navbar-brand">JobSearch</Link>
        <div className="navbar-links">
          <Link to="/" className={isActive('/')}>İlanlar</Link>
          <Link to="/chat" className={isActive('/chat')}>
            <MessageCircle size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            AI Asistan
          </Link>
          {user ? (
            <>
              {(userRole === 'ADMIN' || userRole === 'COMPANY') && (
                <Link to="/admin/jobs" className={startsWith('/admin')}>
                  <Shield size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  Admin
                </Link>
              )}
              <Link to="/me/applications" className={isActive('/me/applications')}>
                <Briefcase size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                Başvurularım
              </Link>
              <Link to="/me/alerts" className={isActive('/me/alerts')}>
                <BellRing size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                Alarmlar
              </Link>
              <Link to="/notifications" className={isActive('/notifications')}>
                <Bell size={16} style={{ verticalAlign: 'middle' }} />
              </Link>
              <Link to="/profile" className={isActive('/profile')}>
                <User size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                {user.email?.split('@')[0]}
              </Link>
              <button className="btn btn-sm btn-secondary" onClick={logout}>
                <LogOut size={14} /> Çıkış
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-sm btn-primary">Giriş Yap</Link>
          )}
        </div>
      </div>
    </nav>
  );
}

