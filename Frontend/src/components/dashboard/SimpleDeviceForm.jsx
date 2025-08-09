import React, { useState } from 'react';
import { Plus, Zap, Thermometer, Power, Settings } from 'lucide-react';
import { deviceAPI } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import Button from '../common/Button';
import Input from '../common/Input';
import Card from '../common/Card';

const SimpleDeviceForm = ({ onDeviceAdded }) => {
  const [formData, setFormData] = useState({
    device_name: '',
    device_type: 'LED'
  });
  const [loading, setLoading] = useState(false);
  const { success: showSuccess, error: showError } = useToast();

  const deviceTypes = [
    { value: 'LED', label: 'LED Light', icon: <Zap size={18} /> },
    { value: 'SENSOR', label: 'Sensor', icon: <Thermometer size={18} /> },
    { value: 'SWITCH', label: 'Switch', icon: <Power size={18} /> },
    { value: 'OTHER', label: 'Other', icon: <Settings size={18} /> }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('🔍 Form submitted with data:', formData);
    
    if (!formData.device_name.trim()) {
      console.log('❌ Validation failed: Device name is empty');
      showError('Device name is required');
      return;
    }

    setLoading(true);
    console.log('🔄 Starting device registration...');
    
    try {
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      console.log('🔑 Token present:', !!token);
      
      if (!token) {
        showError('You need to be logged in to add devices');
        return;
      }

      const deviceData = {
        device_name: formData.device_name.trim(),
        device_type: formData.device_type
      };
      
      console.log('📤 Sending device data:', deviceData);
      
      const response = await deviceAPI.registerDevice(deviceData);
      
      console.log('✅ Device registered successfully:', response.data);
      
      showSuccess(`Device "${formData.device_name}" added successfully!`);
      
      // Reset form
      setFormData({
        device_name: '',
        device_type: 'LED'
      });
      
      console.log('🔄 Form reset, notifying parent component...');
      
      // Notify parent component
      if (onDeviceAdded) {
        onDeviceAdded(response.data);
      }
      
    } catch (error) {
      console.error('❌ Device registration failed:', error);
      console.error('❌ Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      let errorMessage = 'Failed to add device. Please try again.';
      
      if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please login again.';
        // Redirect to login
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showError(errorMessage);
    } finally {
      setLoading(false);
      console.log('🏁 Request completed');
    }
  };

  return (
    <Card className="mb-8">
      <Card.Header>
        <Card.Title className="flex items-center gap-2">
          <Plus size={20} className="text-primary-500" />
          Add New Device
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Device Name */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Device Name
              </label>
              <Input
                type="text"
                placeholder="e.g., Living Room LED"
                value={formData.device_name}
                onChange={(e) => setFormData(prev => ({ ...prev, device_name: e.target.value }))}
                disabled={loading}
                className="w-full"
              />
            </div>

            {/* Device Type */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Device Type
              </label>
              <select
                value={formData.device_type}
                onChange={(e) => setFormData(prev => ({ ...prev, device_type: e.target.value }))}
                disabled={loading}
                className="w-full px-3 py-2 bg-dark-bg-tertiary border border-dark-border rounded-lg text-white focus:border-primary-500 focus:outline-none"
              >
                {deviceTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Device Type Icons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {deviceTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, device_type: type.value }))}
                disabled={loading}
                className={`p-3 rounded-lg border-2 transition-all duration-200 flex items-center justify-center gap-2 ${
                  formData.device_type === type.value
                    ? 'border-primary-500 bg-primary-500/20 text-primary-400'
                    : 'border-dark-border bg-dark-bg-tertiary text-muted hover:border-primary-500/30 hover:text-white'
                }`}
              >
                {type.icon}
                <span className="text-sm font-medium">{type.label}</span>
              </button>
            ))}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={loading || !formData.device_name.trim()}
              icon={<Plus size={16} />}
            >
              {loading ? 'Adding Device...' : 'Add Device'}
            </Button>
          </div>
        </form>
      </Card.Body>
    </Card>
  );
};

export default SimpleDeviceForm;
