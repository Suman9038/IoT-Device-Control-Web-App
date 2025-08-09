import React, { useState, useEffect } from 'react';
import { X, Save, Zap, Thermometer, Power, Settings, Wifi, WifiOff } from 'lucide-react';
import { useDeviceService } from '../../services/deviceService';
import Button from '../common/Button';
import Input from '../common/Input';
import LoadingSpinner from '../common/LoadingSpinner';

const DeviceEditModal = ({ isOpen, onClose, device, onDeviceUpdated }) => {
  const [formData, setFormData] = useState({
    device_name: '',
    device_type: 'LED',
    device_status: 'offline'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { updateDevice } = useDeviceService();

  const deviceTypes = [
    { value: 'LED', label: 'LED Light', icon: <Zap size={20} />, description: 'Smart LED bulbs and strips' },
    { value: 'SENSOR', label: 'Sensor', icon: <Thermometer size={20} />, description: 'Temperature, humidity, motion sensors' },
    { value: 'SWITCH', label: 'Switch', icon: <Power size={20} />, description: 'Smart switches and relays' },
    { value: 'OTHER', label: 'Other', icon: <Settings size={20} />, description: 'Other IoT devices' }
  ];

  const deviceStatuses = [
    { value: 'online', label: 'Online', icon: <Wifi size={16} />, color: 'text-green-500' },
    { value: 'offline', label: 'Offline', icon: <WifiOff size={16} />, color: 'text-red-500' }
  ];

  // Update form data when device prop changes
  useEffect(() => {
    if (device) {
      setFormData({
        device_name: device.device_name || '',
        device_type: device.device_type || 'LED',
        device_status: device.device_status || 'offline'
      });
    }
  }, [device]);

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

    if (!formData.device_name.trim()) {
      newErrors.device_name = 'Device name is required';
    } else if (formData.device_name.trim().length < 2) {
      newErrors.device_name = 'Device name must be at least 2 characters';
    } else if (formData.device_name.trim().length > 50) {
      newErrors.device_name = 'Device name must be less than 50 characters';
    }

    if (!formData.device_type) {
      newErrors.device_type = 'Device type is required';
    }

    if (!formData.device_status) {
      newErrors.device_status = 'Device status is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      console.log('🔍 Updating device:', device.id, formData);
      const updatedDevice = await updateDevice(device.id, formData);
      console.log('✅ Device updated successfully:', updatedDevice);
      
      // Reset form
      setErrors({});
      
      // Close modal and notify parent
      onDeviceUpdated(updatedDevice);
      onClose();
    } catch (error) {
      console.error('❌ Failed to update device:', error);
      // Error is already handled by the service
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setErrors({});
      onClose();
    }
  };

  if (!isOpen || !device) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-gradient-to-br from-dark-bg-primary via-dark-bg-secondary to-dark-bg-tertiary rounded-2xl shadow-2xl w-full max-w-lg border border-dark-border/50 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-border/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl flex items-center justify-center shadow-lg">
              {deviceTypes.find(t => t.value === device.device_type)?.icon || <Settings size={24} />}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Edit Device</h3>
              <p className="text-sm text-muted">Update device information and settings</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-2 rounded-lg text-muted hover:text-white hover:bg-dark-bg-tertiary transition-all duration-200 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Device Name */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-white">
              Device Name
            </label>
            <Input
              type="text"
              name="device_name"
              placeholder="Enter device name"
              value={formData.device_name}
              onChange={handleChange}
              error={errors.device_name}
              disabled={loading}
              className="w-full bg-dark-bg-tertiary border-dark-border focus:border-primary-500"
            />
            {errors.device_name && (
              <p className="text-red-400 text-sm flex items-center gap-1">
                <span>⚠️</span>
                {errors.device_name}
              </p>
            )}
          </div>

          {/* Device Type */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-white">
              Device Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {deviceTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleChange({ target: { name: 'device_type', value: type.value } })}
                  disabled={loading}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                    formData.device_type === type.value
                      ? 'border-primary-500 bg-primary-500/20 text-primary-400 shadow-lg shadow-primary-500/20'
                      : 'border-dark-border bg-dark-bg-tertiary text-muted hover:border-primary-500/30 hover:text-white hover:bg-dark-bg-secondary'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className={`p-2 rounded-lg ${
                      formData.device_type === type.value 
                        ? 'bg-primary-500/20' 
                        : 'bg-dark-bg-secondary'
                    }`}>
                      {type.icon}
                    </div>
                    <div className="text-center">
                      <span className="text-sm font-medium block">{type.label}</span>
                      <span className="text-xs text-muted mt-1 block">{type.description}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            {errors.device_type && (
              <p className="text-red-400 text-sm flex items-center gap-1">
                <span>⚠️</span>
                {errors.device_type}
              </p>
            )}
          </div>

          {/* Device Status */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-white">
              Device Status
            </label>
            <div className="grid grid-cols-2 gap-3">
              {deviceStatuses.map((status) => (
                <button
                  key={status.value}
                  type="button"
                  onClick={() => handleChange({ target: { name: 'device_status', value: status.value } })}
                  disabled={loading}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                    formData.device_status === status.value
                      ? 'border-primary-500 bg-primary-500/20 text-primary-400 shadow-lg shadow-primary-500/20'
                      : 'border-dark-border bg-dark-bg-tertiary text-muted hover:border-primary-500/30 hover:text-white hover:bg-dark-bg-secondary'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <div className="flex items-center justify-center gap-3">
                    <div className={`${
                      formData.device_status === status.value 
                        ? 'text-primary-400' 
                        : status.color
                    }`}>
                      {status.icon}
                    </div>
                    <span className="text-sm font-medium">{status.label}</span>
                  </div>
                </button>
              ))}
            </div>
            {errors.device_status && (
              <p className="text-red-400 text-sm flex items-center gap-1">
                <span>⚠️</span>
                {errors.device_status}
              </p>
            )}
          </div>

          {/* Device Preview */}
          <div className="p-4 bg-dark-bg-tertiary rounded-xl border border-dark-border/50 animate-fade-in">
            <h4 className="text-sm font-semibold text-white mb-2">Device Preview</h4>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-lg flex items-center justify-center">
                {deviceTypes.find(t => t.value === formData.device_type)?.icon}
              </div>
              <div>
                <p className="text-white font-medium">{formData.device_name}</p>
                <p className="text-sm text-muted">
                  {deviceTypes.find(t => t.value === formData.device_type)?.label} • {formData.device_status}
                </p>
              </div>
              <div className="ml-auto">
                <div className={`flex items-center gap-1 text-xs ${
                  formData.device_status === 'online' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {formData.device_status === 'online' ? <Wifi size={12} /> : <WifiOff size={12} />}
                  <span className="capitalize">{formData.device_status}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 bg-dark-bg-tertiary hover:bg-dark-bg-secondary text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading || !formData.device_name.trim()}
              className="flex-1 bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700"
              icon={loading ? <LoadingSpinner size="sm" /> : <Save size={16} />}
            >
              {loading ? 'Updating Device...' : 'Update Device'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeviceEditModal;

