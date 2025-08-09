import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bot } from 'lucide-react';
import OTPVerification from '../components/auth/OTPVerification';

const OTPVerificationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get email from navigation state or redirect to login if not available
  const email = location.state?.email;
  
  React.useEffect(() => {
    if (!email) {
      navigate('/login', { replace: true });
    }
  }, [email, navigate]);

  const handleVerificationSuccess = (data) => {
    navigate('/dashboard', { replace: true });
  };

  const handleBackToLogin = () => {
    navigate('/login', { replace: true });
  };

  if (!email) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-bg-primary via-dark-bg-secondary to-dark-bg-tertiary flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #3b82f6 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, #14b8a6 0%, transparent 50%)`
        }}></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl mb-4 shadow-lg">
            <Bot size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
            Jarvis IoT
          </h1>
          <p className="text-muted">Your Intelligent Assistant</p>
        </div>

        {/* Auth Form Container */}
        <div className="bg-dark-bg-secondary/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-dark-border p-8">
          <OTPVerification
            email={email}
            onVerificationSuccess={handleVerificationSuccess}
            onBackToLogin={handleBackToLogin}
          />
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted">
          <p>© 2025 Jarvis IoT. Built with ❤️ for smart homes.</p>
        </div>
      </div>
    </div>
  );
};

export default OTPVerificationPage;