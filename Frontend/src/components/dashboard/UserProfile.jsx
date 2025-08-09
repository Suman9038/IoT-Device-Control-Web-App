import React, { useState } from 'react';
import { User, Mail, Phone, Edit3, Save, X, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { validateEmail } from '../../utils/helpers';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';

const UserProfile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const { success: showSuccess, error: showError } = useToast();

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

    // Password validation (only if provided)
    if (formData.password.trim()) {
      if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      
      if (!formData.confirmPassword.trim()) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    } else if (formData.confirmPassword.trim()) {
      newErrors.password = 'Please enter a password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEdit = () => {
    setIsEditing(true);
    setFormData({
      username: user?.username || '',
      email: user?.email || '',
      password: '',
      confirmPassword: '',
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      username: user?.username || '',
      email: user?.email || '',
      password: '',
      confirmPassword: '',
    });
    setErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Prepare update data - only include fields that are not empty
      const updateData = {
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
      };

      // Only include password if it's provided
      if (formData.password.trim()) {
        updateData.password = formData.password;
      }

      const result = await updateProfile(updateData);

      if (result.success) {
        showSuccess('Profile updated successfully');
        setIsEditing(false);
        setShowPassword(false);
        setShowConfirmPassword(false);
      } else {
        showError(result.error);
      }
    } catch (error) {
      showError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="max-w-2xl">
      <Card.Header>
        <div className="flex items-center justify-between">
          <Card.Title>Profile Information</Card.Title>
          {!isEditing && (
            <Button
              variant="ghost"
              size="sm"
              icon={<Edit3 size={16} />}
              onClick={handleEdit}
            >
              Edit
            </Button>
          )}
        </div>
      </Card.Header>

      <Card.Body>
        <div className="flex items-center gap-4 mb-6">
          <div className="avatar avatar-xl">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} />
            ) : (
              getInitials(user?.username || 'User')
            )}
          </div>
          <div>
            <h3 className="text-xl font-semibold">{user?.username}</h3>
            <p className="text-muted">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="form-group">
            <label className="form-label">
              <User size={16} className="inline mr-2" />
              Username
            </label>
            {isEditing ? (
              <>
                <Input
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  error={errors.username}
                  disabled={loading}
                />
                {errors.username && <span className="form-error">{errors.username}</span>}
              </>
            ) : (
              <p className="text-dark-text-primary">{user?.username}</p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              <Mail size={16} className="inline mr-2" />
              Email Address
            </label>
            {isEditing ? (
              <>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  disabled={loading}
                />
                {errors.email && <span className="form-error">{errors.email}</span>}
              </>
            ) : (
              <p className="text-dark-text-primary">{user?.email}</p>
            )}
          </div>

          {isEditing && (
            <>
              <div className="form-group">
                <label className="form-label">
                  <Lock size={16} className="inline mr-2" />
                  New Password (Leave blank to keep current)
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    error={errors.password}
                    disabled={loading}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <span className="form-error">{errors.password}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Lock size={16} className="inline mr-2" />
                  Confirm New Password
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    error={errors.confirmPassword}
                    disabled={loading}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
              </div>
            </>
          )}
        </div>
      </Card.Body>

      {isEditing && (
        <Card.Footer>
          <Button
            variant="ghost"
            onClick={handleCancel}
            disabled={loading}
            icon={<X size={16} />}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            loading={loading}
            disabled={loading}
            icon={<Save size={16} />}
          >
            Save Changes
          </Button>
        </Card.Footer>
      )}
    </Card>
  );
};

export default UserProfile;