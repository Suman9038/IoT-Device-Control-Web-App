import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, Home, Wifi, Sparkles } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { validateEmail } from '../../utils/helpers';
import Button from '../common/Button';
import Input from '../common/Input';

const LoginForm = ({ onSwitchToRegister, onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const { login } = useAuth();
  const { error: showError, success: showSuccess } = useToast();

  useEffect(() => {
    // Trigger form animation after component mounts
    const timer = setTimeout(() => setIsFormVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const result = await login(formData);
      
      if (result.success) {
        if (result.requiresOTP) {
          // Login always requires OTP verification
          showSuccess('OTP sent to your email! Redirecting to verification...');
          onLoginSuccess({
            email: formData.email,
            requires_otp: true
          });
        } else {
          // This shouldn't happen for login, but keeping as fallback
          showSuccess('Login successful! Redirecting to dashboard...');
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 1000);
        }
      } else {
        showError(result.error);
      }
    } catch (error) {
      showError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container animate-fade-in">
      {/* Brand Header */}
      <div className="text-center mb-12 animate-slide-up">
        <div className="brand-icon-container mb-6 animate-float">
          <div className="brand-icon-bg">
            <Home size={32} className="text-white" />
          </div>
          <div className="wifi-signals">
            <div className="wifi-signal signal-1"></div>
            <div className="wifi-signal signal-2"></div>
            <div className="wifi-signal signal-3"></div>
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-white mb-3 animate-slide-up-delay">
          Jarvis IoT
        </h1>
        <p className="text-xl text-muted animate-slide-up-delay-2">
          Your Intelligent Assistant
        </p>
      </div>

      {/* Login Form */}
      <div className={`login-form-container ${isFormVisible ? 'animate-slide-up' : 'opacity-0'}`}>
        <div className="text-center mb-10 animate-slide-up-delay-3">
          <h2 className="text-3xl font-bold text-white mb-3">Welcome Back</h2>
          <p className="text-lg text-muted">Sign in to your Jarvis account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in-delay">
          <div className="form-group animate-slide-up-delay-4">
            <label className="form-label">
              <Mail size={18} className="inline mr-3 text-primary-400" />
              Email Address
            </label>
            <Input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              disabled={loading}
              className="login-input"
            />
            {errors.email && (
              <span className="form-error animate-shake">{errors.email}</span>
            )}
          </div>

          <div className="form-group animate-slide-up-delay-5">
            <label className="form-label">
              <Lock size={18} className="inline mr-3 text-primary-400" />
              Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                disabled={loading}
                className="login-input pr-12"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <span className="form-error animate-shake">{errors.password}</span>
            )}
          </div>

          <div className="animate-slide-up-delay-6">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="login-btn w-full"
              loading={loading}
              disabled={loading}
            >
              <Sparkles size={18} className="mr-2" />
              Sign In
            </Button>
          </div>

          <div className="text-center pt-6 animate-slide-up-delay-7">
            <p className="text-muted text-lg">
              Don't have an account?{' '}
              <button
                type="button"
                className="signup-link"
                onClick={onSwitchToRegister}
                disabled={loading}
              >
                Sign up here
              </button>
            </p>
          </div>
        </form>
      </div>

      {/* Footer */}
      <div className="text-center mt-12 animate-slide-up-delay-8">
        <p className="text-muted text-sm">
          © 2025 Jarvis IoT. Built with{' '}
          <span className="text-red-400 animate-heartbeat">❤</span>{' '}
          for smart homes.
        </p>
      </div>
    </div>
  );
};

export default LoginForm;