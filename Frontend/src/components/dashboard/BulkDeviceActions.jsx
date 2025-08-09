import React, { useState } from 'react';
import { Trash2, Power, PowerOff, Zap, Settings } from 'lucide-react';
import { useDeviceService } from '../../services/deviceService';
import { useToast } from '../../hooks/useToast';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';

const BulkDeviceActions = ({ selectedDevices, devices, onDevicesUpdated, onDevicesDeleted }) => {
  const [loading, setLoading] = useState(false);
  const [operationType, setOperationType] = useState(null);

  const { updateDeviceStatus, deleteMultipleDevices } = useDeviceService();
  const { success: showSuccess, error: showError } = useToast();

  const selectedDeviceObjects = devices.filter(device => selectedDevices.includes(device.id));

  const handleBulkStatusUpdate = async (status) => {
    if (selectedDevices.length === 0) {
      showError('No devices selected');
      return;
    }

    setLoading(true);
    setOperationType(status);
    
    try {
      const promises = selectedDevices.map(deviceId => 
        updateDeviceStatus(deviceId, status)
      );
      
      const results = await Promise.all(promises);
      
      // Update the devices in the parent component
      onDevicesUpdated(results);
      
      showSuccess(`${selectedDevices.length} device(s) ${status === 'online' ? 'turned on' : 'turned off'} successfully`);
    } catch (error) {
      showError(`Failed to update devices: ${error.message}`);
    } finally {
      setLoading(false);
      setOperationType(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedDevices.length === 0) {
      showError('No devices selected for deletion');
      return;
    }

    const deviceNames = selectedDeviceObjects.map(d => d.device_name).join(', ');
    if (!window.confirm(`Are you sure you want to delete ${selectedDevices.length} device(s)?\n\nDevices: ${deviceNames}`)) {
      return;
    }

    setLoading(true);
    setOperationType('delete');
    
    try {
      await deleteMultipleDevices(selectedDevices);
      onDevicesDeleted(selectedDevices);
      showSuccess(`${selectedDevices.length} device(s) deleted successfully`);
    } catch (error) {
      showError(`Failed to delete devices: ${error.message}`);
    } finally {
      setLoading(false);
      setOperationType(null);
    }
  };

  const getStats = () => {
    const online = selectedDeviceObjects.filter(d => d.device_status === 'online').length;
    const offline = selectedDeviceObjects.filter(d => d.device_status === 'offline').length;
    
    const byType = {};
    selectedDeviceObjects.forEach(device => {
      const type = device.device_type;
      byType[type] = (byType[type] || 0) + 1;
    });

    return { online, offline, byType };
  };

  if (selectedDevices.length === 0) {
    return null;
  }

  const stats = getStats();

  return (
    <div className="bg-dark-bg-secondary rounded-xl border border-dark-border p-6 animate-slide-up">
      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
        {/* Selection Info */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-2">
            Bulk Actions ({selectedDevices.length} selected)
          </h3>
          <div className="flex flex-wrap gap-4 text-sm text-muted">
            <span>Online: {stats.online}</span>
            <span>Offline: {stats.offline}</span>
            {Object.entries(stats.byType).map(([type, count]) => (
              <span key={type}>{type}: {count}</span>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 flex-wrap">
          <Button
            size="sm"
            variant="success"
            icon={loading && operationType === 'online' ? <LoadingSpinner size="sm" /> : <Power size={16} />}
            onClick={() => handleBulkStatusUpdate('online')}
            disabled={loading}
          >
            Turn On All
          </Button>

          <Button
            size="sm"
            variant="secondary"
            icon={loading && operationType === 'offline' ? <LoadingSpinner size="sm" /> : <PowerOff size={16} />}
            onClick={() => handleBulkStatusUpdate('offline')}
            disabled={loading}
          >
            Turn Off All
          </Button>

          <Button
            size="sm"
            variant="error"
            icon={loading && operationType === 'delete' ? <LoadingSpinner size="sm" /> : <Trash2 size={16} />}
            onClick={handleBulkDelete}
            disabled={loading}
          >
            Delete All
          </Button>
        </div>
      </div>

      {/* Device List Preview */}
      <div className="mt-4 pt-4 border-t border-dark-border/50">
        <div className="flex flex-wrap gap-2">
          {selectedDeviceObjects.slice(0, 5).map(device => (
            <div key={device.id} className="flex items-center gap-2 bg-dark-bg-tertiary rounded-lg px-3 py-1 text-sm">
              <div className={`w-2 h-2 rounded-full ${
                device.device_status === 'online' ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className="text-white">{device.device_name}</span>
              <span className="text-muted text-xs">({device.device_type})</span>
            </div>
          ))}
          
          {selectedDeviceObjects.length > 5 && (
            <div className="flex items-center justify-center bg-dark-bg-tertiary rounded-lg px-3 py-1 text-sm text-muted">
              +{selectedDeviceObjects.length - 5} more
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkDeviceActions;

