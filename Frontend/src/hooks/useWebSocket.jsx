import { useState, useEffect, useCallback } from 'react';
import WebSocketService from '../services/websocket';

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [audioConnected, setAudioConnected] = useState(false);
  const [backendAvailable, setBackendAvailable] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState({
    textConnected: false,
    audioConnected: false,
    backendAvailable: false
  });

  // Check backend availability on mount
  useEffect(() => {
    const checkBackend = async () => {
      const available = await WebSocketService.checkBackendAvailability();
      setBackendAvailable(available);
      updateConnectionStatus();
      
      // Auto-connect to text WebSocket if backend is available
      if (available) {
        connectText(
          (message) => {
            updateConnectionStatus();
            // Handle incoming messages
          },
          (error) => {
            updateConnectionStatus();
            console.error('Text WebSocket error:', error);
          },
          () => {
            updateConnectionStatus();
            console.log('Text WebSocket closed');
          }
        );
      }
    };
    
    checkBackend();
  }, []);

  // Update connection status
  const updateConnectionStatus = useCallback(() => {
    const status = WebSocketService.getConnectionStatus();
    setConnectionStatus(status);
    setIsConnected(status.textConnected);
    setAudioConnected(status.audioConnected);
    setBackendAvailable(status.backendAvailable);
  }, []);

  // Connect to text WebSocket
  const connectText = useCallback(async (onMessage, onError, onClose) => {
    // Check backend availability first
    const available = await WebSocketService.checkBackendAvailability();
    if (!available) {
      console.warn('Backend not available, cannot connect to text WebSocket');
      onError && onError(new Error('Backend not available'));
      return;
    }

    WebSocketService.connectTextSocket(
      (message) => {
        updateConnectionStatus();
        onMessage && onMessage(message);
      },
      (error) => {
        updateConnectionStatus();
        onError && onError(error);
      },
      () => {
        updateConnectionStatus();
        onClose && onClose();
      }
    );
  }, [updateConnectionStatus]);

  // Connect to audio WebSocket
  const connectAudio = useCallback(async (onMessage, onError, onClose, onOpen) => {
    // Check backend availability first
    const available = await WebSocketService.checkBackendAvailability();
    if (!available) {
      console.warn('Backend not available, cannot connect to audio WebSocket');
      onError && onError(new Error('Backend not available'));
      return;
    }

    WebSocketService.connectAudioSocket(
      (message) => {
        updateConnectionStatus();
        onMessage && onMessage(message);
      },
      (error) => {
        updateConnectionStatus();
        onError && onError(error);
      },
      () => {
        updateConnectionStatus();
        onClose && onClose();
      },
      () => {
        updateConnectionStatus();
        onOpen && onOpen();
      }
    );
  }, [updateConnectionStatus]);

  // Send text message
  const sendTextMessage = useCallback((message) => {
    WebSocketService.sendTextMessage(message);
  }, []);

  // Send chat message
  const sendChatMessage = useCallback((message, tone = 'friendly') => {
    WebSocketService.sendChatMessage(message, tone);
  }, []);

  // Send device command
  const sendDeviceCommand = useCallback((deviceId, command) => {
    WebSocketService.sendDeviceCommand(deviceId, command);
  }, []);

  // Send audio data
  const sendAudioData = useCallback((audioData) => {
    WebSocketService.sendAudioData(audioData);
  }, []);

  // Register message handlers
  const onMessage = useCallback((type, handler) => {
    WebSocketService.onMessage(type, handler);
  }, []);

  // Remove message handlers
  const offMessage = useCallback((type) => {
    WebSocketService.offMessage(type);
  }, []);

  // Disconnect all connections
  const disconnect = useCallback(() => {
    WebSocketService.disconnect();
    updateConnectionStatus();
  }, [updateConnectionStatus]);

  // Update status periodically
  useEffect(() => {
    const interval = setInterval(updateConnectionStatus, 1000);
    return () => clearInterval(interval);
  }, [updateConnectionStatus]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      WebSocketService.disconnect();
    };
  }, []);

  return {
    // Connection status
    isConnected,
    audioConnected,
    backendAvailable,
    connectionStatus,
    
    // Connection methods
    connectText,
    connectAudio,
    
    // Message sending methods
    sendTextMessage,
    sendChatMessage,
    sendDeviceCommand,
    sendAudioData,
    
    // Message handling methods
    onMessage,
    offMessage,
    
    // Utility methods
    disconnect,
    updateConnectionStatus
  };
};

export default useWebSocket;
