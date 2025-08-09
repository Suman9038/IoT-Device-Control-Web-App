// API Configuration
export const API_BASE_URL = 'http://localhost:8000';

// WebSocket URLs
export const WS_BASE_URL = 'ws://localhost:8000';
export const WS_TEXT_URL = `${WS_BASE_URL}/ws`;
export const WS_AUDIO_URL = `${WS_BASE_URL}/ws/audio_live`;

// Audio Configuration
export const AUDIO_CONFIG = {
  sampleRate: 16000,
  channels: 1,
  bitsPerSample: 16,
  chunkSize: 4096
};

// Device Types
export const DEVICE_TYPES = {
  LED: 'LED',
  SENSOR: 'SENSOR',
  SWITCH: 'SWITCH'
};

// Toast Types
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning'
};

// Theme
export const THEME = {
  LIGHT: 'light',
  DARK: 'dark'
};
