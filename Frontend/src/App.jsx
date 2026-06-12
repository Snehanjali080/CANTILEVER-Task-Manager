import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';
import Sidebar from './components/Sidebar';


import LoginPage    from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage'; 
import Dashboard    from './pages/Dashboard';
import TasksPage    from './pages/TasksPage';
import BoardPage    from './pages/BoardPage';
import CalendarPage from './pages/CalendarPage';
import SettingsPage from './pages/SettingsPage';

/* ── Protected layout: sidebar + main content ──────────────── */
function AppLayout() {
  const { user, loading } = useAuth();
  if (loading) return <FullPageLoader />;
  if (!user)   return <Navigate to="/login" replace />;
  return (
    <TaskProvider>
      <div style={{ display:'flex', minHeight:'100vh' }}>
        <Sidebar />
        <main style={{ marginLeft:'var(--sidebar-w)', flex:1, minHeight:'100vh' }}>
          <Outlet />
        </main>
      </div>
    </TaskProvider>
  );
}

function GuestLayout() {
  const { user, loading } = useAuth();
  if (loading) return <FullPageLoader />;
  if (user)    return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

function FullPageLoader() {
  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center',
      justifyContent:'center', background:'var(--bg)',
    }}>
      <div style={{ textAlign:'center' }}>
        <div className="spinner spinner-lg" style={{ margin:'0 auto 1rem' }}/>
        <p style={{ color:'var(--text3)', fontFamily:'var(--font-body)' }}>Loading TaskWarm…</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#2D1206',
              color: '#FEF3C7',
              fontFamily: 'var(--font-body)',
              fontSize: '.88rem',
              borderRadius: '10px',
              boxShadow: '0 4px 20px rgba(0,0,0,.25)',
            },
            success: { iconTheme: { primary:'#FBBF24', secondary:'#2D1206' } },
            error:   { iconTheme: { primary:'#FCA5A5', secondary:'#2D1206' } },
          }}
        />
        <Routes>
          {/* Guest */}
          <Route element={<GuestLayout/>}>
            <Route path="/login"    element={<LoginPage/>}/>
            <Route path="/register" element={<RegisterPage/>}/>
          </Route>

          {/* Protected */}
          <Route element={<AppLayout/>}>
            <Route path="/dashboard" element={<Dashboard/>}/>
            <Route path="/tasks"     element={<TasksPage/>}/>
            <Route path="/board"     element={<BoardPage/>}/>
            <Route path="/calendar"  element={<CalendarPage/>}/>
            <Route path="/settings"  element={<SettingsPage/>}/>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace/>}/>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}