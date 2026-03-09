import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';
import ReportsPage from './pages/ReportsPage';
import LogsPage from './pages/LogsPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import { isAuthenticated } from './services/api';
import './index.css';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const Layout = ({ children, onGlobalFilter, globalFilters }) => {
  const location = useLocation();
  const isLogin = location.pathname === '/login' || location.pathname === '/';

  if (isLogin) {
    return <div className="app-container">{children}</div>;
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Header onGlobalFilter={onGlobalFilter} globalFilters={globalFilters} />
        {children}
      </div>
    </div>
  );
};

const App = () => {
  const [globalFilters, setGlobalFilters] = useState({
    city: 'all',
    type: 'all',
    status: 'all',
    minPrice: '',
    maxPrice: ''
  });

  const handleGlobalFilter = (newFilters) => {
    setGlobalFilters(prev => ({ ...prev, ...newFilters }));
  };

  return (
    <BrowserRouter>
      <Layout onGlobalFilter={handleGlobalFilter} globalFilters={globalFilters}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage globalFilters={globalFilters} onGlobalFilter={handleGlobalFilter} />
            </ProtectedRoute>
          } />
          <Route path="/upload" element={<ProtectedRoute><UploadPage /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
          <Route path="/logs" element={<ProtectedRoute><LogsPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

export default App;
