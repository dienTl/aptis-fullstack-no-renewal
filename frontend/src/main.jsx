import React, { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './styles/index.css';
import { AuthProvider, useAuth } from './auth/AuthContext';
import Layout from './components/Layout';
import { ToastProvider } from './components/ToastProvider';

const Home = React.lazy(() => import('./pages/user/Home'));
const Tips = React.lazy(() => import('./pages/user/Tips'));
const Lessons = React.lazy(() => import('./pages/user/Lessons'));
const Profile = React.lazy(() => import('./pages/user/Profile'));
const Login = React.lazy(() => import('./pages/auth/Login'));
const Register = React.lazy(() => import('./pages/auth/Register'));
const ForgotPassword = React.lazy(() => import('./pages/auth/ForgotPassword'));
const ModuleList = React.lazy(() => import('./pages/modules/ModuleList'));
const ExamRunner = React.lazy(() => import('./pages/modules/ExamRunner'));
const History = React.lazy(() => import('./pages/user/History'));
const Notifications = React.lazy(() => import('./pages/user/Notifications'));
const Chat = React.lazy(() => import('./pages/user/Chat'));
const ExamReviews = React.lazy(() => import('./pages/user/ExamReviews'));
const Practice = React.lazy(() => import('./pages/user/Practice'));
const PracticeSkill = React.lazy(() => import('./pages/user/PracticeSkill'));
const PracticeRunner = React.lazy(() => import('./pages/user/PracticeRunner'));
const AptisScore = React.lazy(() => import('./pages/user/AptisScore'));
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));

function PageFallback() {
  return <div className="min-h-screen grid place-items-center text-slate-500 font-bold">Đang tải...</div>;
}

function Guard({ children, admin = false }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen grid place-items-center text-slate-500 font-bold">Đang tải...</div>;
  if (!user) return <Navigate to="/login" />;
  if (admin && user.role !== 'ADMIN') return <Navigate to="/reading" />;
  return children;
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route element={<Guard><Layout /></Guard>}>
                <Route index element={<Navigate to="/home" />} />
                <Route path="home" element={<Home />} />
                <Route path="tips" element={<Tips />} />
                <Route path="aptis-score" element={<AptisScore />} />
                <Route path="practice" element={<Practice />} />
                <Route path="practice/:skill/:id" element={<PracticeRunner />} />
                <Route path="practice/:skill" element={<PracticeSkill />} />
                <Route path=":module" element={<ModuleList />} />
                <Route path=":module/:id" element={<ExamRunner />} />
                <Route path="history" element={<History />} />
                <Route path="reviews" element={<ExamReviews />} />
                <Route path="lessons" element={<Lessons />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="chat" element={<Chat />} />
                <Route path="profile" element={<Profile />} />
                <Route path="admin" element={<Guard admin><AdminDashboard /></Guard>} />
              </Route>
              <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>
);
