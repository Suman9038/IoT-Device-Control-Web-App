import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/register/user', userData),
  login: (credentials) => api.post('/login', credentials),
  verifyOTP: (otpData) => api.post('/verify-otp', otpData),
  getCurrentUser: () => api.get('/user/me'),
  updateProfile: (profileData) => api.put('/user/update_profile', profileData),
};

// Device API
export const deviceAPI = {
  // Get all devices
  getDevices: () => api.get('/device/get_device'),
  
  // Get single device by ID
  getDevice: (deviceId) => api.get(`/device/get_device/${deviceId}`),
  
  // Register new device
  registerDevice: (deviceData) => api.post('/register/device', deviceData),
  
  // Update device details
  updateDevice: (deviceId, deviceData) => api.put(`/device/update_device/${deviceId}`, deviceData),
  
  // Update device status only
  updateDeviceStatus: (deviceId, statusData) => api.patch(`/device/update_status/${deviceId}`, statusData),
  
  // Delete single device
  deleteDevice: (deviceId) => api.delete(`/device/delete_device/${deviceId}`),
  
  // Delete multiple devices
  deleteMultipleDevices: (deviceIds) => api.delete('/device/device_multiple_devices', { 
    data: { device_ids: deviceIds } 
  }),
  
  // Send command to device
  sendDeviceCommand: (deviceId, command) => api.post(`/device/${deviceId}/command`, { command }),
};

// Voice API
export const voiceAPI = {
  uploadVoiceCommand: (audioFile) => {
    const formData = new FormData();
    formData.append('file', audioFile);
    return api.post('/api/voice-command', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Root API
export const rootAPI = {
  getWelcome: () => api.get('/'),
};

export default api;
