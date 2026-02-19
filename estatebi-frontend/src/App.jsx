import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';
import ReportsPage from './pages/ReportsPage';
import LogsPage from './pages/LogsPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import { isAuthenticated } from './services/api';
import './index.css';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const Layout = ({ children }) => {
  const location = useLocation();
  const isLogin = location.pathname === '/login' || location.pathname === '/';

  if (isLogin) {
    return <div className="app-container">{children}</div>;
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        {children}
      </div>
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/upload" element={<ProtectedRoute><UploadPage /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
          <Route path="/logs" element={<ProtectedRoute><LogsPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

export default App;
