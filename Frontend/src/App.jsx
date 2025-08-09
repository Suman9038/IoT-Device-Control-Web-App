import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { useToast } from './hooks/useToast';
import { ToastContainer } from './components/common/Toast';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OTPVerificationPage from './pages/OTPVerificationPage';
import DashboardPage from './pages/DashboardPage';
import SettingsPage from './pages/SettingsPage';
import LoadingSpinner from './components/common/LoadingSpinner';

// Import all styles
import './styles/globals.css';
import './styles/animations.css';
import './styles/components.css';
import './styles/responsive.css';

const AppContent = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const { toasts, removeToast } = useToast();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg-primary flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size="xl" />
          <p className="text-muted">Loading Jarvis...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Protected Routes */}
        <Route 
          path="/dashboard" 
          element={
            isAuthenticated ? <DashboardPage /> : <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/settings" 
          element={
            isAuthenticated ? <SettingsPage /> : <Navigate to="/login" replace />
          } 
        />
        
        {/* Auth Routes */}
        <Route 
          path="/login" 
          element={
            !isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" replace />
          } 
        />
        <Route 
          path="/register" 
          element={
            !isAuthenticated ? <RegisterPage /> : <Navigate to="/dashboard" replace />
          } 
        />
        <Route 
          path="/verify-otp" 
          element={
            !isAuthenticated ? <OTPVerificationPage /> : <Navigate to="/dashboard" replace />
          } 
        />
        
        {/* Default Route */}
        <Route 
          path="/" 
          element={
            <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
          } 
        />
        
        {/* Catch all route */}
        <Route 
          path="*" 
          element={
            <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
          } 
        />
      </Routes>
      
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </Router>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;