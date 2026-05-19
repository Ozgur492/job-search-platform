import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import JobDetailPage from './pages/JobDetailPage';
import ChatPage from './pages/ChatPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import AdminJobsPage from './pages/AdminJobsPage';
import AdminJobFormPage from './pages/AdminJobFormPage';
import MyApplicationsPage from './pages/MyApplicationsPage';
import MyAlertsPage from './pages/MyAlertsPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin/jobs" element={<AdminJobsPage />} />
          <Route path="/admin/jobs/new" element={<AdminJobFormPage />} />
          <Route path="/admin/jobs/:id/edit" element={<AdminJobFormPage />} />
          <Route path="/me/applications" element={<MyApplicationsPage />} />
          <Route path="/me/alerts" element={<MyAlertsPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

