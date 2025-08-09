import React, { useState, useEffect } from 'react';
import { Trash2, Edit3, Power, Wifi, WifiOff } from 'lucide-react';
import { deviceAPI } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import MinimalDeviceForm from './MinimalDeviceForm';
import Card from '../common/Card';
import Button from '../common/Button';
import Switch from '../common/Switch';
import Badge from '../common/Badge';
import LoadingSpinner from '../common/LoadingSpinner';

const SimpleDeviceList = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const { success: showSuccess, error: showError } = useToast();

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      console.log('🔄 Fetching devices...');
      const response = await deviceAPI.getDevices();
      console.log('✅ Devices fetched:', response.data);
      setDevices(response.data || []);
    } catch (error) {
      console.error('❌ Failed to fetch devices:', error);
      showError('Failed to load devices');
    } finally {
      setLoading(false);
    }
  };

  const handleDeviceAdded = (newDevice) => {
    console.log('➕ Device added:', newDevice);
    setDevices(prev => [newDevice, ...prev]);
  };

  const [pendingDelete, setPendingDelete] = useState(null);

  const handleDeleteDevice = (deviceId, deviceName) => {
    setPendingDelete({ deviceId, deviceName });
  };

  const confirmDeleteDevice = async () => {
    if (!pendingDelete) return;
    const { deviceId, deviceName } = pendingDelete;
    setPendingDelete(null);
    try {
      console.log('🗑️ Deleting device:', deviceId);
      await deviceAPI.deleteDevice(deviceId);
      setDevices(prev => prev.filter(device => device.id !== deviceId));
      showSuccess(`Device "${deviceName}" deleted successfully`);
    } catch (error) {
      console.error('❌ Failed to delete device:', error);
      showError('Failed to delete device');
    }
  };

  const cancelDeleteDevice = () => {
    setPendingDelete(null);
    showSuccess('Device deletion cancelled');
  };

  const handleStatusToggle = async (deviceId, currentStatus) => {
    const newStatus = currentStatus === 'online' ? 'offline' : 'online';
    
    try {
      console.log('🔄 Updating device status:', deviceId, newStatus);
      const response = await deviceAPI.updateDeviceStatus(deviceId, { device_status: newStatus });
      console.log('✅ Status updated:', response.data);
      
      setDevices(prev => 
        prev.map(device => 
          device.id === deviceId ? { ...device, device_status: newStatus } : device
        )
      );
      
      showSuccess(`Device ${newStatus === 'online' ? 'turned on' : 'turned off'} successfully`);
    } catch (error) {
      console.error('❌ Failed to update device status:', error);
      showError('Failed to update device status');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-white">Your Devices</h2>
        <p className="text-muted text-lg">
          Manage and control your IoT devices ({devices.length} total, {devices.filter(d => d.device_status === 'online').length} online)
        </p>
      </div>

      {/* Add Device Form (Minimal) */}
      <MinimalDeviceForm onDeviceAdded={handleDeviceAdded} />

      {/* Devices Grid */}
      {devices.length === 0 ? (
        <Card className="text-center py-12">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto">
              <Power size={32} className="text-primary-500" />
            </div>
            <h3 className="text-xl font-semibold text-white">No devices yet</h3>
            <p className="text-muted">Add your first IoT device using the form above</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {devices.map((device) => (
            <Card key={device.id} className="hover-lift">
              <Card.Body>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-white">{device.device_name}</h3>
                    <p className="text-muted text-sm">{device.device_type}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {device.device_status === 'online' ? (
                      <Badge variant="success" className="flex items-center gap-1">
                        <Wifi size={12} />
                        Online
                      </Badge>
                    ) : (
                      <Badge variant="error" className="flex items-center gap-1">
                        <WifiOff size={12} />
                        Offline
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  {device.last_seen && (
                    <p className="text-xs text-muted">
                      Last seen: {new Date(device.last_seen).toLocaleString()}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">Power:</span>
                    <Switch
                      checked={device.device_status === 'online'}
                      onChange={() => handleStatusToggle(device.id, device.device_status)}
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={<Edit3 size={14} />}
                      onClick={() => showSuccess('Edit functionality coming soon!')}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="error"
                      icon={<Trash2 size={14} />}
                      onClick={() => handleDeleteDevice(device.id, device.device_name)}
                    >
                      Delete
                    </Button>
                  </div>
                  {pendingDelete && pendingDelete.deviceId === device.id && (
                    <div className="mt-2 flex gap-2">
                      <span className="text-warning-400 font-medium">Are you sure you want to delete "{pendingDelete.deviceName}"?</span>
                      <Button size="xs" variant="error" onClick={confirmDeleteDevice}>Yes, Delete</Button>
                      <Button size="xs" variant="ghost" onClick={cancelDeleteDevice}>Cancel</Button>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SimpleDeviceList;
