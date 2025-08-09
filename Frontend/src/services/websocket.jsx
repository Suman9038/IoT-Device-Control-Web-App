import { WS_TEXT_URL, WS_AUDIO_URL } from '../utils/constants';

class WebSocketService {
  constructor() {
    this.textSocket = null;
    this.audioSocket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.messageHandlers = new Map();
    this.isBackendAvailable = false;
    this.lastAudioSend = 0; // Added for audio throttling
  }

  // Check if backend is available
  async checkBackendAvailability() {
    try {
      const response = await fetch('http://localhost:8000/', {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      this.isBackendAvailable = response.ok;
      return this.isBackendAvailable;
    } catch (error) {
      console.warn('Backend not available:', error.message);
      this.isBackendAvailable = false;
      return false;
    }
  }

  // Register message handlers
  onMessage(type, handler) {
    this.messageHandlers.set(type, handler);
  }

  // Remove message handler
  offMessage(type) {
    this.messageHandlers.delete(type);
  }

  // Handle incoming messages
  handleMessage(data) {
    try {
      const message = typeof data === 'string' ? JSON.parse(data) : data;
      const type = message.type;
      
      if (this.messageHandlers.has(type)) {
        this.messageHandlers.get(type)(message);
      }
      
      // Also call general message handler if exists
      if (this.messageHandlers.has('*')) {
        this.messageHandlers.get('*')(message);
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  }

  // Text WebSocket connection
  connectTextSocket(onMessage, onError, onClose) {
    if (!this.isBackendAvailable) {
      console.warn('Backend not available, skipping text WebSocket connection');
      onError && onError(new Error('Backend not available'));
      return;
    }

    try {
      this.textSocket = new WebSocket(WS_TEXT_URL);
      
      this.textSocket.onopen = () => {
        console.log('Text WebSocket connected');
        this.reconnectAttempts = 0;
      };

      this.textSocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
          onMessage && onMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.textSocket.onerror = (error) => {
        console.error('Text WebSocket error:', error);
        onError && onError(error);
      };

      this.textSocket.onclose = () => {
        console.log('Text WebSocket disconnected');
        onClose && onClose();
        this.reconnectTextSocket(onMessage, onError, onClose);
      };
    } catch (error) {
      console.error('Failed to connect text WebSocket:', error);
      onError && onError(error);
    }
  }

  // Audio WebSocket connection
  connectAudioSocket(onMessage, onError, onClose, onOpen) {
    if (!this.isBackendAvailable) {
      console.warn('Backend not available, skipping audio WebSocket connection');
      onError && onError(new Error('Backend not available'));
      return;
    }

    try {
      this.audioSocket = new WebSocket(WS_AUDIO_URL);
      this.audioSocket.binaryType = 'arraybuffer';
      
      this.audioSocket.onopen = () => {
        console.log('Audio WebSocket connected');
        this.reconnectAttempts = 0;
        onOpen && onOpen();
      };

      this.audioSocket.onmessage = (event) => {
        try {
          // Handle both text and binary messages
          if (typeof event.data === 'string') {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
            onMessage && onMessage(data);
          } else {
            // Binary audio data
            onMessage && onMessage(event.data);
          }
        } catch (error) {
          console.error('Error handling audio WebSocket message:', error);
        }
      };

      this.audioSocket.onerror = (error) => {
        console.error('Audio WebSocket error:', error);
        onError && onError(error);
      };

      this.audioSocket.onclose = () => {
        console.log('Audio WebSocket disconnected');
        onClose && onClose();
        this.reconnectAudioSocket(onMessage, onError, onClose, onOpen);
      };
    } catch (error) {
      console.error('Failed to connect audio WebSocket:', error);
      onError && onError(error);
    }
  }

  // Send text message
  sendTextMessage(message) {
    if (this.textSocket && this.textSocket.readyState === WebSocket.OPEN) {
      try {
        this.textSocket.send(JSON.stringify(message));
      } catch (error) {
        console.error('Failed to send text message:', error);
      }
    } else {
      console.warn('Text WebSocket is not connected');
    }
  }

  // Send chat message
  sendChatMessage(message, tone = 'friendly') {
    this.sendTextMessage({
      type: 'chat_message',
      message,
      tone,
      timestamp: Date.now()
    });
  }

  // Send device command
  sendDeviceCommand(deviceId, command) {
    this.sendTextMessage({
      type: 'device_command',
      device_id: deviceId,
      command,
      timestamp: Date.now()
    });
  }

  // Send audio data with throttling
  sendAudioData(audioData) {
    if (this.audioSocket && this.audioSocket.readyState === WebSocket.OPEN) {
      try {
        // Throttle audio data to prevent overwhelming the connection
        if (!this.lastAudioSend || Date.now() - this.lastAudioSend > 50) {
          this.audioSocket.send(audioData);
          this.lastAudioSend = Date.now();
        }
      } catch (error) {
        console.error('Failed to send audio data:', error);
      }
    } else {
      console.warn('Audio WebSocket is not connected');
    }
  }

  // Reconnect text socket
  reconnectTextSocket(onMessage, onError, onClose) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Attempting to reconnect text WebSocket (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connectTextSocket(onMessage, onError, onClose);
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  // Reconnect audio socket
  reconnectAudioSocket(onMessage, onError, onClose, onOpen) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Attempting to reconnect audio WebSocket (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connectAudioSocket(onMessage, onError, onClose, onOpen);
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  // Disconnect all sockets
  disconnect() {
    if (this.textSocket) {
      this.textSocket.close();
      this.textSocket = null;
    }
    if (this.audioSocket) {
      this.audioSocket.close();
      this.audioSocket = null;
    }
    this.messageHandlers.clear();
  }

  // Get connection status
  getConnectionStatus() {
    return {
      textConnected: this.textSocket?.readyState === WebSocket.OPEN,
      audioConnected: this.audioSocket?.readyState === WebSocket.OPEN,
      backendAvailable: this.isBackendAvailable
    };
  }
}

export default new WebSocketService();
