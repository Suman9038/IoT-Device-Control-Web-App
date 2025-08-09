import { deviceAPI } from './api';
import { useToast } from '../hooks/useToast';

class DeviceService {
  constructor() {
    this.devices = [];
    this.loading = false;
    this.error = null;
  }

  // Get all devices
  async getDevices() {
    this.loading = true;
    this.error = null;
    
    try {
      const response = await deviceAPI.getDevices();
      this.devices = response.data || [];
      return this.devices;
    } catch (error) {
      this.error = error.response?.data?.detail || 'Failed to fetch devices';
      throw error;
    } finally {
      this.loading = false;
    }
  }

  // Get single device
  async getDevice(deviceId) {
    try {
      const response = await deviceAPI.getDevice(deviceId);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch device');
    }
  }

  // Register new device
  async registerDevice(deviceData) {
    try {
      const response = await deviceAPI.registerDevice(deviceData);
      const newDevice = response.data;
      
      // Add to local devices array
      this.devices.push(newDevice);
      
      return newDevice;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to register device');
    }
  }

  // Update device
  async updateDevice(deviceId, deviceData) {
    try {
      const response = await deviceAPI.updateDevice(deviceId, deviceData);
      const updatedDevice = response.data;
      
      // Update in local devices array
      this.devices = this.devices.map(device => 
        device.id === deviceId ? updatedDevice : device
      );
      
      return updatedDevice;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to update device');
    }
  }

  // Update device status
  async updateDeviceStatus(deviceId, status) {
    try {
      const response = await deviceAPI.updateDeviceStatus(deviceId, { device_status: status });
      const updatedDevice = response.data;
      
      // Update in local devices array
      this.devices = this.devices.map(device => 
        device.id === deviceId ? updatedDevice : device
      );
      
      return updatedDevice;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to update device status');
    }
  }

  // Delete device
  async deleteDevice(deviceId) {
    try {
      await deviceAPI.deleteDevice(deviceId);
      
      // Remove from local devices array
      this.devices = this.devices.filter(device => device.id !== deviceId);
      
      return true;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to delete device');
    }
  }

  // Delete multiple devices
  async deleteMultipleDevices(deviceIds) {
    try {
      const response = await deviceAPI.deleteMultipleDevices(deviceIds);
      
      // Remove from local devices array
      this.devices = this.devices.filter(device => !deviceIds.includes(device.id));
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to delete devices');
    }
  }

  // Send command to device
  async sendDeviceCommand(deviceId, command) {
    try {
      const response = await deviceAPI.sendDeviceCommand(deviceId, command);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to send device command');
    }
  }

  // Get devices by type
  getDevicesByType(type) {
    return this.devices.filter(device => device.device_type.toLowerCase() === type.toLowerCase());
  }

  // Get online devices
  getOnlineDevices() {
    return this.devices.filter(device => device.device_status === 'online');
  }

  // Get offline devices
  getOfflineDevices() {
    return this.devices.filter(device => device.device_status === 'offline');
  }

  // Search devices
  searchDevices(query) {
    const searchTerm = query.toLowerCase();
    return this.devices.filter(device => 
      device.device_name.toLowerCase().includes(searchTerm) ||
      device.device_type.toLowerCase().includes(searchTerm)
    );
  }

  // Get device statistics
  getDeviceStats() {
    const total = this.devices.length;
    const online = this.getOnlineDevices().length;
    const offline = this.getOfflineDevices().length;
    
    const byType = {};
    this.devices.forEach(device => {
      const type = device.device_type;
      byType[type] = (byType[type] || 0) + 1;
    });

    return {
      total,
      online,
      offline,
      byType
    };
  }
}

// Hook for using device service
export const useDeviceService = () => {
  const service = new DeviceService();
  const { success: showSuccess, error: showError } = useToast();

  const handleError = (error, operation) => {
    const message = error.message || `Failed to ${operation}`;
    showError(message);
    console.error(`Device service error (${operation}):`, error);
  };

  return {
    // Get all devices with error handling
    getDevices: async () => {
      try {
        const devices = await service.getDevices();
        return devices;
      } catch (error) {
        handleError(error, 'fetch devices');
        return [];
      }
    },

    // Register device with success/error handling
    registerDevice: async (deviceData) => {
      try {
        const device = await service.registerDevice(deviceData);
        showSuccess('Device registered successfully');
        return device;
      } catch (error) {
        handleError(error, 'register device');
        throw error;
      }
    },

    // Update device with success/error handling
    updateDevice: async (deviceId, deviceData) => {
      try {
        const device = await service.updateDevice(deviceId, deviceData);
        showSuccess('Device updated successfully');
        return device;
      } catch (error) {
        handleError(error, 'update device');
        throw error;
      }
    },

    // Update device status with success/error handling
    updateDeviceStatus: async (deviceId, status) => {
      try {
        const device = await service.updateDeviceStatus(deviceId, status);
        showSuccess(`Device ${status === 'online' ? 'turned on' : 'turned off'} successfully`);
        return device;
      } catch (error) {
        handleError(error, 'update device status');
        throw error;
      }
    },

    // Delete device with confirmation and success/error handling
    deleteDevice: async (deviceId, deviceName) => {
      if (!window.confirm(`Are you sure you want to delete "${deviceName}"?`)) {
        return false;
      }

      try {
        await service.deleteDevice(deviceId);
        showSuccess('Device deleted successfully');
        return true;
      } catch (error) {
        handleError(error, 'delete device');
        return false;
      }
    },

    // Send device command with success/error handling
    sendDeviceCommand: async (deviceId, command) => {
      try {
        const result = await service.sendDeviceCommand(deviceId, command);
        showSuccess(`Command "${command}" sent successfully`);
        return result;
      } catch (error) {
        handleError(error, 'send device command');
        throw error;
      }
    },

    // Get device statistics
    getDeviceStats: () => service.getDeviceStats(),

    // Search devices
    searchDevices: (query) => service.searchDevices(query),

    // Get devices by type
    getDevicesByType: (type) => service.getDevicesByType(type),

    // Get online/offline devices
    getOnlineDevices: () => service.getOnlineDevices(),
    getOfflineDevices: () => service.getOfflineDevices(),
  };
};

export default DeviceService;
