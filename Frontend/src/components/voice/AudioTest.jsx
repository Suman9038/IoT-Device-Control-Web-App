import React, { useState } from 'react';
import { Mic, MicOff, Volume2, Play, Square } from 'lucide-react';
import audioService from '../../services/audioService';
import Card from '../common/Card';
import Button from '../common/Button';

const AudioTest = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [pcmData, setPcmData] = useState(null);
  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const startRecording = async () => {
    try {
      addLog('Starting recording...');
      
      const success = await audioService.startRecording((audioData) => {
        addLog(`Received audio data: ${audioData.constructor.name}, size: ${audioData.byteLength || audioData.size} bytes`);
        
        if (audioData instanceof ArrayBuffer) {
          setPcmData(audioData);
          addLog(`PCM data received: ${audioData.byteLength} bytes`);
        }
      });

      if (success) {
        setIsRecording(true);
        addLog('Recording started successfully');
      } else {
        addLog('Failed to start recording');
      }
    } catch (error) {
      addLog(`Recording error: ${error.message}`);
    }
  };

  const stopRecording = async () => {
    try {
      addLog('Stopping recording...');
      
      const blob = await audioService.stopRecording();
      if (blob) {
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        addLog(`Recording stopped. Blob size: ${blob.size} bytes`);
      } else {
        addLog('No audio blob received');
      }
      
      setIsRecording(false);
    } catch (error) {
      addLog(`Stop recording error: ${error.message}`);
      setIsRecording(false);
    }
  };

  const playAudio = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
      addLog('Playing recorded audio');
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <Card className="mb-6">
      <Card.Header>
        <Card.Title>Audio Recording Test</Card.Title>
        <Card.Subtitle>Test audio recording functionality</Card.Subtitle>
      </Card.Header>

      <Card.Body>
        <div className="space-y-6">
          {/* Recording Controls */}
          <div className="flex gap-4">
            <Button
              variant={isRecording ? 'error' : 'primary'}
              onClick={isRecording ? stopRecording : startRecording}
              icon={isRecording ? <MicOff size={20} /> : <Mic size={20} />}
              disabled={isRecording}
            >
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </Button>

            {audioUrl && (
              <Button
                variant="secondary"
                onClick={playAudio}
                icon={<Play size={20} />}
              >
                Play Recording
              </Button>
            )}
          </div>

          {/* Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-dark-bg-tertiary rounded-lg">
              <h4 className="font-medium mb-2">Recording Status</h4>
              <p className={`text-sm ${isRecording ? 'text-success-400' : 'text-muted'}`}>
                {isRecording ? 'Recording...' : 'Not Recording'}
              </p>
            </div>

            <div className="p-4 bg-dark-bg-tertiary rounded-lg">
              <h4 className="font-medium mb-2">Audio Blob</h4>
              <p className="text-sm text-muted">
                {audioBlob ? `${audioBlob.size} bytes` : 'None'}
              </p>
            </div>

            <div className="p-4 bg-dark-bg-tertiary rounded-lg">
              <h4 className="font-medium mb-2">PCM Data</h4>
              <p className="text-sm text-muted">
                {pcmData ? `${pcmData.byteLength} bytes` : 'None'}
              </p>
            </div>
          </div>

          {/* Logs */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Debug Logs</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearLogs}
                className="text-muted hover:text-white"
              >
                Clear
              </Button>
            </div>
            
            <div className="h-48 overflow-y-auto bg-dark-bg-primary rounded-lg p-3 font-mono text-sm">
              {logs.length === 0 ? (
                <p className="text-muted">No logs yet...</p>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="text-muted mb-1">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default AudioTest;


