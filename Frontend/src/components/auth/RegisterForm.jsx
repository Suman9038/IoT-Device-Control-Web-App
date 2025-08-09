import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Eye, EyeOff, Home, Wifi, Sparkles, Shield } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { validateEmail } from '../../utils/helpers';
import Button from '../common/Button';
import Input from '../common/Input';

const RegisterForm = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const { register } = useAuth();
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

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.trim().length < 2) {
      newErrors.username = 'Username must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const userData = {
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      };

      const result = await register(userData);
      
      if (result.success) {
        showSuccess('Registration successful! You can now login with your credentials.');
        // Reset form
        setFormData({
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
        });
        // Navigate to login after successful registration
        setTimeout(() => {
          onSwitchToLogin && onSwitchToLogin();
        }, 1500);
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
    <div className="register-container animate-fade-in">
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

      {/* Register Form */}
      <div className={`register-form-container ${isFormVisible ? 'animate-slide-up' : 'opacity-0'}`}>
        <div className="text-center mb-10 animate-slide-up-delay-3">
          <h2 className="text-3xl font-bold text-white mb-3">Create Account</h2>
          <p className="text-lg text-muted">Join Jarvis and start controlling your IoT devices</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in-delay">
          <div className="form-group animate-slide-up-delay-4">
            <label className="form-label">
              <User size={18} className="inline mr-3 text-primary-400" />
              Username
            </label>
            <Input
              type="text"
              name="username"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
              error={errors.username}
              disabled={loading}
              className="register-input"
            />
            {errors.username && (
              <span className="form-error animate-shake">{errors.username}</span>
            )}
          </div>

          <div className="form-group animate-slide-up-delay-5">
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
              className="register-input"
            />
            {errors.email && (
              <span className="form-error animate-shake">{errors.email}</span>
            )}
          </div>

          <div className="form-group animate-slide-up-delay-6">
            <label className="form-label">
              <Lock size={18} className="inline mr-3 text-primary-400" />
              Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                disabled={loading}
                className="register-input pr-12"
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

          <div className="form-group animate-slide-up-delay-7">
            <label className="form-label">
              <Shield size={18} className="inline mr-3 text-primary-400" />
              Confirm Password
            </label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                disabled={loading}
                className="register-input pr-12"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="form-error animate-shake">{errors.confirmPassword}</span>
            )}
          </div>

          <div className="animate-slide-up-delay-8">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="register-btn w-full"
              loading={loading}
              disabled={loading}
            >
              <Sparkles size={18} className="mr-2" />
              Create Account
            </Button>
          </div>

          <div className="text-center pt-6 animate-slide-up-delay-9">
            <p className="text-muted text-lg">
              Already have an account?{' '}
              <button
                type="button"
                className="signin-link"
                onClick={onSwitchToLogin}
                disabled={loading}
              >
                Sign in here
              </button>
            </p>
          </div>
        </form>
      </div>

      {/* Footer */}
      <div className="text-center mt-12 animate-slide-up-delay-10">
        <p className="text-muted text-sm">
          © 2025 Jarvis IoT. Built with{' '}
          <span className="text-red-400 animate-heartbeat">❤</span>{' '}
          for smart homes.
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;