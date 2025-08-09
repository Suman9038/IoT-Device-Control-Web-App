import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Trash2 } from 'lucide-react';
import { useDeviceService } from '../../services/deviceService';
import { useToast } from '../../hooks/useToast';
import DeviceCard from './DeviceCard';
import DeviceRegistrationModal from './DeviceRegistrationModal';
import DeviceEditModal from './DeviceEditModal';
import BulkDeviceActions from './BulkDeviceActions';
import Button from '../common/Button';
import Input from '../common/Input';
import LoadingSpinner from '../common/LoadingSpinner';

const DeviceList = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  
  const { 
    getDevices, 
    deleteDevice, 
    deleteMultipleDevices,
    getDeviceStats,
    searchDevices,
    getDevicesByType
  } = useDeviceService();
  
  const { error: showError, success: showSuccess } = useToast();

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const fetchedDevices = await getDevices();
      setDevices(fetchedDevices);
    } catch (error) {
      console.error('Failed to fetch devices:', error);
      // Keep existing devices if fetch fails
    } finally {
      setLoading(false);
    }
  };

  const handleDeviceUpdate = (deviceId, updatedDevice) => {
    setDevices(prev => 
      prev.map(device => 
        device.id === deviceId ? updatedDevice : device
      )
    );
  };

  const handleDeviceDelete = async (deviceId, deviceName) => {
    const success = await deleteDevice(deviceId, deviceName);
    if (success) {
      setDevices(prev => prev.filter(device => device.id !== deviceId));
      setSelectedDevices(prev => prev.filter(id => id !== deviceId));
    }
  };

  const handleDeviceAdded = (newDevice) => {
    setDevices(prev => [newDevice, ...prev]);
    showSuccess('Device added successfully!');
  };

  const handleDeviceEdit = (device) => {
    setEditingDevice(device);
    setShowEditModal(true);
  };

  const handleDeviceUpdated = (updatedDevice) => {
    setDevices(prev => 
      prev.map(device => 
        device.id === updatedDevice.id ? updatedDevice : device
      )
    );
    showSuccess('Device updated successfully!');
  };

  const handleBulkDevicesUpdated = (updatedDevices) => {
    setDevices(prev => {
      const updatedMap = new Map(updatedDevices.map(device => [device.id, device]));
      return prev.map(device => updatedMap.get(device.id) || device);
    });
  };

  const handleBulkDevicesDeleted = (deletedDeviceIds) => {
    setDevices(prev => prev.filter(device => !deletedDeviceIds.includes(device.id)));
    setSelectedDevices([]);
  };

  const handleBulkDelete = async () => {
    if (selectedDevices.length === 0) {
      showError('No devices selected for deletion');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedDevices.length} device(s)?`)) {
      return;
    }

    setBulkDeleteLoading(true);
    try {
      await deleteMultipleDevices(selectedDevices);
      setDevices(prev => prev.filter(device => !selectedDevices.includes(device.id)));
      setSelectedDevices([]);
      showSuccess(`${selectedDevices.length} device(s) deleted successfully`);
    } catch (error) {
      console.error('Failed to delete devices:', error);
    } finally {
      setBulkDeleteLoading(false);
    }
  };

  const handleDeviceSelection = (deviceId, selected) => {
    setSelectedDevices(prev => 
      selected 
        ? [...prev, deviceId]
        : prev.filter(id => id !== deviceId)
    );
  };

  const handleSelectAll = () => {
    if (selectedDevices.length === filteredDevices.length) {
      setSelectedDevices([]);
    } else {
      setSelectedDevices(filteredDevices.map(device => device.id));
    }
  };

  // Filter and search devices
  const filteredDevices = devices.filter(device => {
    const matchesSearch = device.device_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.device_type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || device.device_type?.toLowerCase() === filterType.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });

  const deviceStats = getDeviceStats();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center space-y-6">
          <LoadingSpinner size="xl" />
          <p className="text-muted text-lg">Loading your devices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-card space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
        <div className="flex-1 space-y-3">
          <h2 className="text-3xl font-bold text-white animate-slide-up">Your Devices</h2>
          <p className="text-muted text-lg animate-slide-up-delay">
            Manage and control your IoT devices ({deviceStats.total} total, {deviceStats.online} online)
          </p>
        </div>
        
        <div className="flex gap-3">
          {selectedDevices.length > 0 && (
            <Button
              variant="error"
              icon={<Trash2 size={18} />}
              onClick={handleBulkDelete}
              loading={bulkDeleteLoading}
              className="whitespace-nowrap animate-slide-up-delay-2 hover-scale"
            >
              Delete ({selectedDevices.length})
            </Button>
          )}
          
          <Button
            variant="primary"
            icon={<Plus size={18} />}
            onClick={() => setShowRegistrationModal(true)}
            className="whitespace-nowrap animate-slide-up-delay-2 hover-scale"
          >
            + Add Device
          </Button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="flex flex-col lg:flex-row gap-6 animate-slide-up-delay-3">
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Search devices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-lg"
          />
        </div>
        
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="input lg:w-auto min-w-[140px] text-lg"
        >
          <option value="all">All Types</option>
          <option value="led">LED</option>
          <option value="sensor">Sensor</option>
          <option value="switch">Switch</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Bulk Selection Controls */}
      {devices.length > 0 && (
        <div className="flex items-center gap-4 animate-slide-up-delay-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedDevices.length === filteredDevices.length && filteredDevices.length > 0}
              onChange={handleSelectAll}
              className="w-4 h-4 text-primary-500 bg-dark-bg-tertiary border-dark-border rounded focus:ring-primary-500"
            />
            <span className="text-sm text-muted">Select All</span>
          </label>
          
          {selectedDevices.length > 0 && (
            <span className="text-sm text-primary-400">
              {selectedDevices.length} device(s) selected
            </span>
          )}
        </div>
      )}

      {/* Bulk Actions */}
      <BulkDeviceActions
        selectedDevices={selectedDevices}
        devices={devices}
        onDevicesUpdated={handleBulkDevicesUpdated}
        onDevicesDeleted={handleBulkDevicesDeleted}
      />

      {/* Content Section */}
      {filteredDevices.length === 0 ? (
        <div className="dashboard-empty-card animate-fade-in-delay">
          <div className="w-20 h-20 bg-glass rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl animate-float">
            <Filter size={32} className="text-muted" />
          </div>
          <h3 className="text-xl font-semibold mb-4 text-white animate-slide-up">No devices found</h3>
          <p className="text-muted mb-8 text-center max-w-lg mx-auto text-lg leading-relaxed">
            {searchTerm || filterType !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Get started by adding your first IoT device'
            }
          </p>
          <Button
            variant="primary"
            className="btn-primary mx-auto animate-pulse-slow hover-scale"
            icon={<Plus size={18} />}
            onClick={() => setShowRegistrationModal(true)}
          >
            + Add Your First Device
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in-delay">
          {filteredDevices.map((device, index) => (
            <div 
              key={device.id} 
              className="animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <DeviceCard
                device={device}
                onUpdate={handleDeviceUpdate}
                onDelete={handleDeviceDelete}
                onEdit={handleDeviceEdit}
                selected={selectedDevices.includes(device.id)}
                onSelectionChange={(selected) => handleDeviceSelection(device.id, selected)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Device Registration Modal */}
      <DeviceRegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        onDeviceAdded={handleDeviceAdded}
      />

      {/* Device Edit Modal */}
      <DeviceEditModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingDevice(null);
        }}
        device={editingDevice}
        onDeviceUpdated={handleDeviceUpdated}
      />
    </div>
  );
};

export default DeviceList;