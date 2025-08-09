import React, { useState } from 'react';
import { 
  Power, 
  Zap, 
  Thermometer, 
  Droplets, 
  Settings, 
  Trash2,
  Edit3,
  Wifi,
  WifiOff,
  Check
} from 'lucide-react';
import { useDeviceService } from '../../services/deviceService';
import { useToast } from '../../hooks/useToast';
import { formatDateTime } from '../../utils/helpers';
import Card from '../common/Card';
import Button from '../common/Button';
import Switch from '../common/Switch';
import Badge from '../common/Badge';

const DeviceCard = ({ device, onUpdate, onDelete, selected, onSelectionChange, onEdit }) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(device.device_status === 'online');
  
  const { updateDeviceStatus, sendDeviceCommand } = useDeviceService();
  const { success: showSuccess, error: showError } = useToast();

  const handleToggleStatus = async () => {
    setLoading(true);
    try {
      const newStatus = !status;
      const statusValue = newStatus ? 'online' : 'offline';
      
      const updatedDevice = await updateDeviceStatus(device.id, statusValue);
      setStatus(newStatus);
      onUpdate && onUpdate(device.id, updatedDevice);
    } catch (error) {
      showError('Failed to update device status');
    } finally {
      setLoading(false);
    }
  };

  const handleBlink = async () => {
    setLoading(true);
    try {
      await sendDeviceCommand(device.id, 'blink');
      showSuccess(`${device.device_name} is blinking!`);
    } catch (error) {
      showError('Failed to send blink command');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    await onDelete(device.id, device.device_name);
  };

  const handleSelectionChange = (e) => {
    onSelectionChange && onSelectionChange(e.target.checked);
  };

  const getDeviceIcon = () => {
    switch (device.device_type?.toLowerCase()) {
      case 'led':
        return <Zap size={24} />;
      case 'sensor':
        return <Thermometer size={24} />;
      case 'switch':
        return <Power size={24} />;
      default:
        return <Settings size={24} />;
    }
  };

  const getStatusBadge = () => {
    if (device.device_status === 'offline') {
      return <Badge variant="error">Offline</Badge>;
    }
    return status ? 
      <Badge variant="success">Online</Badge> : 
      <Badge variant="secondary">Off</Badge>;
  };

  const isOnline = device.device_status === 'online';

  return (
    <Card className={`device-card hover-lift transition-all ${selected ? 'ring-2 ring-primary-500 bg-primary-500/10' : ''}`}>
      {/* Selection Checkbox */}
      {onSelectionChange && (
        <div className="absolute top-4 right-4">
          <input
            type="checkbox"
            checked={selected}
            onChange={handleSelectionChange}
            className="w-4 h-4 text-primary-500 bg-dark-bg-tertiary border-dark-border rounded focus:ring-primary-500"
          />
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-lg ${status ? 'bg-primary-500' : 'bg-gray-600'} transition-colors`}>
            {getDeviceIcon()}
          </div>
          <div>
            <h3 className="font-semibold text-lg">{device.device_name}</h3>
            <p className="text-muted text-sm">{device.device_type}</p>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      <div className="space-y-3 mb-4">
        {device.last_seen && (
          <div className="flex items-center gap-2 text-sm text-muted">
            {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
            Last seen: {formatDateTime(device.last_seen)}
          </div>
        )}

        {device.temperature && (
          <div className="flex items-center gap-2 text-sm">
            <Thermometer size={16} className="text-orange-500" />
            Temperature: {device.temperature}°C
          </div>
        )}

        {device.moisture && (
          <div className="flex items-center gap-2 text-sm">
            <Droplets size={16} className="text-blue-500" />
            Soil Moisture: {device.moisture}%
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Power:</span>
          <Switch
            checked={status}
            onChange={handleToggleStatus}
            disabled={loading || !isOnline}
          />
        </div>

        <div className="flex gap-2">
          {device.device_type?.toLowerCase() === 'led' && (
            <Button
              size="sm"
              variant="secondary"
              onClick={handleBlink}
              disabled={loading || !isOnline}
              icon={<Zap size={16} />}
            >
              Blink
            </Button>
          )}
          
          <Button
            size="sm"
            variant="ghost"
            icon={<Edit3 size={16} />}
            disabled={loading}
            onClick={() => onEdit && onEdit(device)}
          />
          
          <Button
            size="sm"
            variant="error"
            onClick={handleDelete}
            disabled={loading}
            icon={<Trash2 size={16} />}
          />
        </div>
      </div>
    </Card>
  );
};

export default DeviceCard;