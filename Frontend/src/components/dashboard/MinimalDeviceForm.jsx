import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

const MinimalDeviceForm = ({ onDeviceAdded }) => {
  const { success: showSuccess, error: showError, info: showInfo } = useToast();
  const [deviceName, setDeviceName] = useState('');
  const [deviceType, setDeviceType] = useState('LED');
  const [loading, setLoading] = useState(false);

  const handleAddDevice = async () => {
    console.log('🚀 Button clicked!');
    
    if (!deviceName.trim()) {
      showInfo('Please enter a device name');
      return;
    }

    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);
      
      if (!token) {
        showError('No authentication token found. Please login again.');
        return;
      }

      console.log('Making API call...');
      
      const response = await fetch('http://localhost:8000/register/device', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          device_name: deviceName.trim(),
          device_type: deviceType
        })
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const newDevice = await response.json();
        console.log('✅ Device created:', newDevice);
        showSuccess(`Device "${deviceName}" added successfully!`);
        
        setDeviceName('');
        
        if (onDeviceAdded) {
          onDeviceAdded(newDevice);
        }
      } else {
        const errorText = await response.text();
        console.error('❌ API Error:', errorText);
        showError(`Failed to add device: ${errorText}`);
      }
      
    } catch (error) {
      console.error('❌ Network Error:', error);
      showError(`Network error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      border: '2px solid #3b82f6', 
      borderRadius: '8px', 
      marginBottom: '20px',
      backgroundColor: '#1f2937'
    }}>
      <h3 style={{ color: 'white', marginBottom: '15px' }}>
        <Plus size={20} style={{ display: 'inline', marginRight: '8px' }} />
        Add device
      </h3>
      
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Device name..."
          value={deviceName}
          onChange={(e) => setDeviceName(e.target.value)}
          disabled={loading}
          style={{
            padding: '8px 12px',
            borderRadius: '4px',
            border: '1px solid #6b7280',
            backgroundColor: '#374151',
            color: 'white',
            minWidth: '200px'
          }}
        />
        <select
          value={deviceType}
          onChange={e => setDeviceType(e.target.value)}
          disabled={loading}
          style={{
            padding: '8px 12px',
            borderRadius: '4px',
            border: '1px solid #6b7280',
            backgroundColor: '#374151',
            color: 'white',
            minWidth: '120px'
          }}
        >
          <option value="LED">LED</option>
          <option value="FAN">FAN</option>
          <option value="BULB">BULB</option>
          <option value="PLUG">PLUG</option>
          <option value="SENSOR">SENSOR</option>
          <option value="OTHER">OTHER</option>
        </select>
        <button
          onClick={handleAddDevice}
          disabled={loading || !deviceName.trim()}
          style={{
            padding: '8px 16px',
            backgroundColor: loading ? '#6b7280' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          <Plus size={16} />
          {loading ? 'Adding...' : 'Add Device'}
        </button>
      </div>
    </div>
  );
};

export default MinimalDeviceForm;
