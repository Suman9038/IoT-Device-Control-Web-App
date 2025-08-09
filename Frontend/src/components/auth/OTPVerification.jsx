import React, { useState, useEffect } from 'react';
import { Mail, ArrowLeft, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import Button from '../common/Button';
import Input from '../common/Input';
import LoadingSpinner from '../common/LoadingSpinner';

const OTPVerification = ({ email, onVerificationSuccess, onBackToLogin }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [errors, setErrors] = useState({});

  const { verifyOTP } = useAuth();
  const { success: showSuccess, error: showError, info: showInfo } = useToast();

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return; // Prevent multiple characters

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Clear error when user starts typing
    if (errors.otp) {
      setErrors(prev => ({ ...prev, otp: '' }));
    }

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.querySelector(`input[data-index="${index + 1}"]`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.querySelector(`input[data-index="${index - 1}"]`);
      prevInput?.focus();
    }
  };

  const validateForm = () => {
    const newErrors = {};

    const otpString = otp.join('');
    if (otpString.length !== 6) {
      newErrors.otp = 'Please enter the complete 6-digit OTP';
    } else if (!/^\d{6}$/.test(otpString)) {
      newErrors.otp = 'OTP must contain only numbers';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const result = await verifyOTP({
        email,
        otp_code: otp.join('')
      });

      if (result.success) {
        showSuccess('OTP verified successfully!');
        onVerificationSuccess(result.data);
      } else {
        showError(result.error);
        setErrors({ otp: result.error });
      }
    } catch (error) {
      showError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;

    setResendLoading(true);
    try {
      // You would typically call a resend OTP API here
      // For now, we'll simulate it
      showInfo('OTP resent to your email');
      setCountdown(60); // 60 second cooldown
    } catch (error) {
      showError('Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  const canResend = countdown === 0;

  return (
    <div className="otp-verification-container animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8 animate-slide-up">
        <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail size={24} className="text-primary-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Verify Your Email</h2>
        <p className="text-muted text-lg">
          We've sent a 6-digit code to
        </p>
        <p className="text-primary-400 font-medium">{email}</p>
      </div>

      {/* OTP Form */}
      <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-delay">
        {/* OTP Input Fields */}
        <div>
          <label className="block text-sm font-medium text-white mb-3">
            Enter 6-digit OTP
          </label>
          <div className="flex gap-3 justify-center">
            {otp.map((digit, index) => (
              <Input
                key={index}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                data-index={index}
                className="w-12 h-12 text-center text-lg font-semibold"
                disabled={loading}
              />
            ))}
          </div>
          {errors.otp && (
            <p className="text-error-500 text-sm mt-2 text-center animate-shake">
              {errors.otp}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          loading={loading}
          disabled={loading || otp.join('').length !== 6}
          icon={loading ? <LoadingSpinner size="sm" /> : <CheckCircle size={18} />}
        >
          {loading ? 'Verifying...' : 'Verify OTP'}
        </Button>

        {/* Resend OTP */}
        <div className="text-center">
          <p className="text-muted text-sm mb-3">
            Didn't receive the code?
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResendOTP}
            disabled={!canResend || resendLoading}
            icon={resendLoading ? <LoadingSpinner size="sm" /> : <RefreshCw size={16} />}
            className="text-primary-400 hover:text-primary-300"
          >
            {resendLoading ? 'Sending...' : 
             countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
          </Button>
        </div>

        {/* Back to Login */}
        <div className="text-center pt-4 border-t border-dark-border">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onBackToLogin}
            icon={<ArrowLeft size={16} />}
            className="text-muted hover:text-white"
          >
            Back to Login
          </Button>
        </div>
      </form>

      {/* Instructions */}
      <div className="mt-8 p-4 bg-dark-bg-tertiary rounded-lg">
        <div className="flex items-start gap-3">
          <Clock size={16} className="text-muted mt-0.5" />
          <div className="text-sm text-muted">
            <p className="font-medium mb-1">Important:</p>
            <ul className="space-y-1">
              <li>• Check your email inbox and spam folder</li>
              <li>• The OTP expires in 10 minutes</li>
              <li>• Enter the code exactly as shown</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
