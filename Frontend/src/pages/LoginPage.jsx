import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot } from 'lucide-react';
import LoginForm from '../components/auth/LoginForm';

const LoginPage = () => {
  const navigate = useNavigate();

  const handleSwitchToRegister = () => {
    navigate('/register');
  };

  const handleLoginSuccess = (data) => {
    // If login returns OTP required, switch to verification
    if (data.requires_otp) {
      navigate('/verify-otp', { 
        state: { 
          email: data.email,
          fromLogin: true 
        } 
      });
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="login-container relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
        <div className="absolute top-3/4 right-1/4 w-64 h-64 bg-secondary-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-1/4 left-1/2 w-64 h-64 bg-primary-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative w-full max-w-md fade-in">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl mb-6 shadow-2xl hover-glow">
            <Bot size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-400 via-primary-300 to-secondary-400 bg-clip-text text-transparent mb-2">
            Jarvis IoT
          </h1>
          <p className="text-muted text-lg">Your Intelligent Assistant</p>
        </div>

        {/* Auth Form Container */}
        <div className="login-card hover-lift">
          <LoginForm
            onSwitchToRegister={handleSwitchToRegister}
            onLoginSuccess={handleLoginSuccess}
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

export default LoginPage;