import { AUDIO_CONFIG } from '../utils/constants';

class AudioService {
  constructor() {
    this.mediaRecorder = null;
    this.audioContext = null;
    this.stream = null;
    this.isRecording = false;
    this.audioChunks = [];
    this.audioProcessor = null;
    this.scriptNode = null;
    this.pcmBuffer = []; // Buffer for PCM data
    this.lastSendTime = 0;
    this.sendInterval = 3000; // Send every 3 seconds
  }

  // Initialize audio context
  async initializeAudio() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: AUDIO_CONFIG.sampleRate,
      });
      return true;
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
      return false;
    }
  }

  // Get user media with better constraints
  async getUserMedia() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: { ideal: AUDIO_CONFIG.sampleRate },
          channelCount: { ideal: AUDIO_CONFIG.channels },
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      return true;
    } catch (error) {
      console.error('Failed to get user media:', error);
      return false;
    }
  }

  // Start recording with direct PCM capture
  async startRecording(onDataAvailable) {
    if (this.isRecording) return false;

    try {
      // Initialize audio context first
      if (!this.audioContext) {
        const success = await this.initializeAudio();
        if (!success) return false;
      }

      if (!this.stream) {
        const success = await this.getUserMedia();
        if (!success) return false;
      }

      this.audioChunks = [];
      this.pcmBuffer = [];
      this.lastSendTime = Date.now();
      
      // Method 1: Try direct PCM capture first (most reliable)
      if (this.audioContext && this.stream) {
        return this.startDirectPCMRecording(onDataAvailable);
      }
      
      // Method 2: Fallback to MediaRecorder
      return this.startMediaRecorderRecording(onDataAvailable);
      
    } catch (error) {
      console.error('Failed to start recording:', error);
      return false;
    }
  }

  // Direct PCM recording method
  async startDirectPCMRecording(onDataAvailable) {
    try {
      const source = this.audioContext.createMediaStreamSource(this.stream);
      
      // Create a script processor for real-time audio processing
      // Increased buffer size for better speech recognition
      this.scriptNode = this.audioContext.createScriptProcessor(4096, 1, 1);
      
      this.scriptNode.onaudioprocess = (event) => {
        if (!this.isRecording) return;
        
        const inputBuffer = event.inputBuffer;
        const inputData = inputBuffer.getChannelData(0);
        
        // Convert float32 to int16 PCM with optimization
        const pcmData = new Int16Array(inputData.length);
        
        // Use a more efficient conversion
        for (let i = 0; i < inputData.length; i++) {
          const sample = inputData[i];
          // Apply some noise reduction
          if (Math.abs(sample) > 0.01) {
            pcmData[i] = Math.max(-32768, Math.min(32767, Math.floor(sample * 32768)));
          } else {
            pcmData[i] = 0;
          }
        }
        
        // Add to PCM buffer
        this.pcmBuffer.push(...pcmData);
        
        // Send data periodically (every 3 seconds)
        const currentTime = Date.now();
        if (currentTime - this.lastSendTime >= this.sendInterval) {
          if (this.pcmBuffer.length > 0) {
            const bufferToSend = new Int16Array(this.pcmBuffer);
            onDataAvailable && onDataAvailable(bufferToSend.buffer);
            this.pcmBuffer = []; // Clear buffer after sending
            this.lastSendTime = currentTime;
          }
        }
      };
      
      source.connect(this.scriptNode);
      this.scriptNode.connect(this.audioContext.destination);
      this.isRecording = true;
      console.log('Started direct PCM recording');
      return true;
      
    } catch (error) {
      console.error('Direct PCM recording failed, falling back to MediaRecorder:', error);
      return this.startMediaRecorderRecording(onDataAvailable);
    }
  }

  // MediaRecorder fallback method
  async startMediaRecorderRecording(onDataAvailable) {
    try {
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 128000,
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
          
          // Send data periodically
          const currentTime = Date.now();
          if (currentTime - this.lastSendTime >= this.sendInterval) {
            const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
            onDataAvailable && onDataAvailable(audioBlob);
            this.audioChunks = [];
            this.lastSendTime = currentTime;
          }
        }
      };

      this.mediaRecorder.start(1000); // Collect data every second
      this.isRecording = true;
      console.log('Started MediaRecorder recording');
      return true;
      
    } catch (error) {
      console.error('MediaRecorder recording failed:', error);
      return false;
    }
  }

  // Stop recording
  async stopRecording() {
    this.isRecording = false;
    
    try {
      // Stop MediaRecorder if active
      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.stop();
      }
      
      // Stop script processor if active
      if (this.scriptNode) {
        this.scriptNode.disconnect();
        this.scriptNode = null;
      }
      
      // Send any remaining PCM data
      if (this.pcmBuffer.length > 0) {
        const bufferToSend = new Int16Array(this.pcmBuffer);
        return bufferToSend.buffer;
      }
      
      // Return MediaRecorder blob if available
      if (this.audioChunks.length > 0) {
        return new Blob(this.audioChunks, { type: 'audio/webm' });
      }
      
      return null;
      
    } catch (error) {
      console.error('Error stopping recording:', error);
      return null;
    }
  }

  // Convert audio data to PCM format
  async convertToPCM(audioData) {
    try {
      if (audioData instanceof ArrayBuffer) {
        // Already PCM data
        return audioData;
      } else if (audioData instanceof Blob) {
        // Convert blob to PCM
        return await this.convertBlobToPCM(audioData);
      } else {
        console.error('Unsupported audio data type:', typeof audioData);
        return null;
      }
    } catch (error) {
      console.error('Error converting audio to PCM:', error);
      return null;
    }
  }

  // Convert blob to PCM
  async convertBlobToPCM(audioBlob) {
    try {
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: AUDIO_CONFIG.sampleRate,
      });
      
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      const channelData = audioBuffer.getChannelData(0);
      
      // Convert to PCM16
      const pcmData = new Int16Array(channelData.length);
      for (let i = 0; i < channelData.length; i++) {
        const sample = channelData[i];
        if (Math.abs(sample) > 0.01) {
          pcmData[i] = Math.max(-32768, Math.min(32767, Math.floor(sample * 32768)));
        } else {
          pcmData[i] = 0;
        }
      }
      
      return pcmData.buffer;
      
    } catch (error) {
      console.error('Failed to convert blob to PCM:', error);
      return null;
    }
  }

  // Create a simple PCM buffer from array buffer
  createSimplePCMBuffer(arrayBuffer) {
    try {
      const uint8Array = new Uint8Array(arrayBuffer);
      const int16Array = new Int16Array(uint8Array.buffer);
      
      // Ensure we have the right format
      const pcmBuffer = new Int16Array(int16Array.length);
      for (let i = 0; i < int16Array.length; i++) {
        pcmBuffer[i] = int16Array[i];
      }
      
      return pcmBuffer.buffer;
    } catch (error) {
      console.error('Error creating PCM buffer:', error);
      return null;
    }
  }

  // Create WAV file from PCM buffer
  createWAVFile(pcmBuffer) {
    try {
      const buffer = new ArrayBuffer(44 + pcmBuffer.byteLength);
      const view = new DataView(buffer);
      
      const writeString = (offset, string) => {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      };
      
      const writeUint32 = (offset, value) => {
        view.setUint32(offset, value, true);
      };
      
      const writeUint16 = (offset, value) => {
        view.setUint16(offset, value, true);
      };
      
      // WAV header
      writeString(0, 'RIFF');
      writeUint32(4, 36 + pcmBuffer.byteLength);
      writeString(8, 'WAVE');
      writeString(12, 'fmt ');
      writeUint32(16, 16);
      writeUint16(20, 1);
      writeUint16(22, 1);
      writeUint32(24, AUDIO_CONFIG.sampleRate);
      writeUint32(28, AUDIO_CONFIG.sampleRate * 2);
      writeUint16(32, 2);
      writeUint16(34, 16);
      writeString(36, 'data');
      writeUint32(40, pcmBuffer.byteLength);
      
      // Copy PCM data
      const pcmView = new Uint8Array(pcmBuffer);
      const wavView = new Uint8Array(buffer, 44);
      wavView.set(pcmView);
      
      return buffer;
    } catch (error) {
      console.error('Error creating WAV file:', error);
      return null;
    }
  }

  // Cleanup resources
  cleanup() {
    this.isRecording = false;
    
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    
    if (this.scriptNode) {
      this.scriptNode.disconnect();
      this.scriptNode = null;
    }
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.audioChunks = [];
    this.pcmBuffer = [];
  }
}

export default new AudioService();
