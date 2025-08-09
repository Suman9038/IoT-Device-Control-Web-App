import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Upload, Volume2, Wifi, WifiOff, AlertTriangle, Sparkles } from 'lucide-react';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useToast } from '../../hooks/useToast';
import { voiceAPI } from '../../services/api';
import audioService from '../../services/audioService';
import Card from '../common/Card';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import MicRecorder from './MicRecorder';
import AudioUpload from './AudioUpload';
import AudioTest from './AudioTest';

const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [processing, setProcessing] = useState(false);
  const [audioConnected, setAudioConnected] = useState(false);
  const [showAudioTest, setShowAudioTest] = useState(false);

  const { connectAudio, sendAudioData, audioConnected: wsAudioConnected, backendAvailable } = useWebSocket();
  const { success: showSuccess, error: showError, info: showInfo, warning: showWarning } = useToast();

  useEffect(() => {
    // Connect to audio WebSocket when component mounts
    connectAudio(handleAudioResponse, handleAudioError, handleAudioClose, handleAudioOpen);
  }, []);

  useEffect(() => {
    setAudioConnected(wsAudioConnected);
  }, [wsAudioConnected]);

  const handleAudioOpen = () => {
    setAudioConnected(true);
    showInfo('Gemini Voice Assistant connected and ready');
  };

  const handleAudioClose = () => {
    setAudioConnected(false);
    setIsListening(false);
    showError('Voice assistant disconnected');
  };

  const handleAudioError = (error) => {
    console.error('Audio WebSocket error:', error);
    setAudioConnected(false);
    setIsListening(false);
    
    if (error.message === 'Backend not available') {
      showWarning('Backend server is not running. Voice features will be limited.');
    } else {
      showError('Voice assistant connection error');
    }
  };

  const startListening = async () => {
    if (!backendAvailable) {
      showWarning('Backend server is not running. Please start the backend server to use voice features.');
      return;
    }

    if (!audioConnected) {
      showError('Audio connection not established');
      return;
    }

    setIsListening(true);
    setTranscript('');
    setResponse('');

    try {
      const success = await audioService.startRecording((audioData) => {
        // audioData is now either a PCM buffer (ArrayBuffer) or a Blob
        if (audioData instanceof ArrayBuffer) {
          // Direct PCM data - send it immediately
          sendAudioData(audioData);
        } else if (audioData instanceof Blob) {
          // MediaRecorder data - convert to PCM first
          audioService.convertToPCM(audioData).then(pcmBuffer => {
            if (pcmBuffer) {
              sendAudioData(pcmBuffer);
            }
          }).catch(error => {
            console.error('Audio conversion error:', error);
            // Don't show error for every conversion failure
          });
        }
      });

      if (!success) {
        throw new Error('Failed to start recording');
      }

      showInfo('Listening... Speak naturally!');
    } catch (error) {
      showError('Failed to start voice recording');
      setIsListening(false);
    }
  };

  const stopListening = async () => {
    setIsListening(false);
    setProcessing(true);

    try {
      const audioBlob = await audioService.stopRecording();
      if (audioBlob) {
        showInfo('Processing voice command...');
      }
    } catch (error) {
      console.error('Failed to stop voice recording:', error);
      // Don't show error to user for stop recording issues
    } finally {
      setProcessing(false);
    }
  };

  const handleAudioResponse = (data) => {
    try {
      // Handle both string and object responses
      const response = typeof data === 'string' ? JSON.parse(data) : data;
      
      console.log('Gemini Voice assistant response:', response);
      
      switch (response.type) {
        case 'transcript':
          setTranscript(response.text);
          showInfo('Processing your request...');
          break;
          
        case 'ai_response':
          setResponse(response.response);
          showSuccess('Voice command processed successfully');
          speakResponse(response.response);
          break;
          
        case 'command_response':
          setResponse(response.message);
          showSuccess('Voice command processed successfully');
          speakResponse(response.message);
          break;
          
        case 'error':
          showError(response.message);
          break;
          
        default:
          console.log('Unknown response type:', response.type);
      }
    } catch (error) {
      console.error('Error parsing audio response:', error);
    }
  };

  const speakResponse = (text) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      // Use a better voice if available
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Google') || 
        voice.name.includes('Natural') || 
        voice.name.includes('Premium')
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      speechSynthesis.speak(utterance);
    }
  };

  const handleFileUpload = async (file) => {
    if (!backendAvailable) {
      showWarning('Backend server is not running. Please start the backend server to use voice features.');
      return;
    }

    setProcessing(true);
    try {
      const response = await voiceAPI.uploadVoiceCommand(file);
      if (response.success) {
        setTranscript(response.transcript || 'Audio processed');
        setResponse(response.response || 'Command executed');
        showSuccess('Voice command uploaded and processed successfully');
        speakResponse(response.response || 'Command executed');
      } else {
        showError(response.message || 'Failed to process voice command');
      }
    } catch (error) {
      console.error('Voice upload error:', error);
      showError('Failed to upload voice command');
    } finally {
      setProcessing(false);
    }
  };

  const testVoice = () => {
    const testText = "Hello! I'm your Gemini-powered voice assistant. How can I help you today?";
    speakResponse(testText);
    showInfo('Testing voice synthesis...');
  };

  const clearTranscript = () => {
    setTranscript('');
    setResponse('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Gemini Voice Assistant</h2>
            <p className="text-sm text-gray-600">Powered by Google Gemini Live API</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {audioConnected ? (
            <div className="flex items-center space-x-1 text-green-600">
              <Wifi className="w-4 h-4" />
              <span className="text-sm">Connected</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1 text-red-600">
              <WifiOff className="w-4 h-4" />
              <span className="text-sm">Disconnected</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Voice Interface */}
      <Card className="p-6">
        <div className="space-y-6">
          {/* Status and Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                onClick={isListening ? stopListening : startListening}
                disabled={!audioConnected || !backendAvailable}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  isListening 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white'
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-5 h-5" />
                    <span>Stop Listening</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5" />
                    <span>Start Listening</span>
                  </>
                )}
              </Button>
              
              <Button
                onClick={testVoice}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Volume2 className="w-4 h-4" />
                <span>Test Voice</span>
              </Button>
            </div>

            <Button
              onClick={() => setShowAudioTest(!showAudioTest)}
              variant="ghost"
              className="text-sm"
            >
              {showAudioTest ? 'Hide' : 'Show'} Audio Debug
            </Button>
          </div>

          {/* Connection Status */}
          {!backendAvailable && (
            <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">
                Backend server is not running. Voice features will be limited.
              </span>
            </div>
          )}

          {/* Audio Test Component */}
          {showAudioTest && (
            <AudioTest />
          )}

          {/* Transcript and Response */}
          <div className="space-y-4">
            {transcript && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700">What you said:</h3>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-800">{transcript}</p>
                </div>
              </div>
            )}

            {response && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700">Assistant response:</h3>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800">{response}</p>
                </div>
              </div>
            )}

            {(transcript || response) && (
              <Button
                onClick={clearTranscript}
                variant="ghost"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear
              </Button>
            )}
          </div>

          {/* Processing Indicator */}
          {processing && (
            <div className="flex items-center space-x-2 text-blue-600">
              <LoadingSpinner size="sm" />
              <span className="text-sm">Processing your request...</span>
            </div>
          )}

          {/* Instructions */}
          <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
            <h3 className="text-sm font-medium text-purple-800 mb-2">How to use:</h3>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• Click "Start Listening" and speak naturally</li>
              <li>• Say "turn on the light" to control devices</li>
              <li>• Ask questions or have a conversation</li>
              <li>• No wake word needed - just speak!</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* File Upload */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Upload Voice Command</h3>
        <AudioUpload onFileUpload={handleFileUpload} disabled={!backendAvailable} />
      </Card>
    </div>
  );
};

export default VoiceAssistant;