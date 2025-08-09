import React, { useState, useRef } from 'react';
import { Mic, Square, Download } from 'lucide-react';
import audioService from '../../services/audioService';
import { useToast } from '../../hooks/useToast';
import Card from '../common/Card';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';

const MicRecorder = ({ onRecordingComplete, disabled = false }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [duration, setDuration] = useState(0);
  const durationInterval = useRef(null);

  const { error: showError, success: showSuccess } = useToast();

  const startRecording = async () => {
    try {
      const success = await audioService.startRecording();
      if (success) {
        setIsRecording(true);
        setDuration(0);
        setRecordedBlob(null);
        
        // Start duration counter
        durationInterval.current = setInterval(() => {
          setDuration(prev => prev + 1);
        }, 1000);
        
        showSuccess('Recording started');
      } else {
        showError('Failed to start recording. Please check microphone permissions.');
      }
    } catch (error) {
      showError('Failed to access microphone');
    }
  };

  const stopRecording = async () => {
    try {
      const audioBlob = await audioService.stopRecording();
      if (audioBlob) {
        setRecordedBlob(audioBlob);
        showSuccess('Recording completed');
      }
    } catch (error) {
      showError('Failed to stop recording');
    } finally {
      setIsRecording(false);
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
        durationInterval.current = null;
      }
    }
  };

  const downloadRecording = () => {
    if (!recordedBlob) return;

    const url = URL.createObjectURL(recordedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recording-${Date.now()}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const processRecording = async () => {
    if (!recordedBlob) return;

    try {
      // Convert to WAV format
      const pcmBuffer = await audioService.convertToPCM(recordedBlob);
      if (pcmBuffer) {
        const wavBlob = audioService.createWAVFile(pcmBuffer);
        onRecordingComplete && onRecordingComplete(wavBlob);
      } else {
        showError('Failed to process recording');
      }
    } catch (error) {
      showError('Failed to process recording');
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card>
      <Card.Header>
        <Card.Title>Voice Recorder</Card.Title>
        <Card.Subtitle>Record voice commands directly from your microphone</Card.Subtitle>
      </Card.Header>

      <Card.Body>
        <div className="text-center space-y-4">
          {/* Recording Status */}
          <div className={`p-4 rounded-lg ${
            isRecording ? 'bg-error-500/20 border border-error-500' : 'bg-dark-bg-tertiary'
          }`}>
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${
                isRecording ? 'bg-error-500 animate-pulse' : 'bg-gray-500'
              }`}></div>
              <span className="font-medium">
                {isRecording ? 'Recording...' : 'Ready to Record'}
              </span>
            </div>
            <p className="text-lg font-mono">
              {formatDuration(duration)}
            </p>
          </div>

          {/* Recording Controls */}
          <div className="flex justify-center gap-3">
            {!isRecording ? (
              <Button
                variant="primary"
                onClick={startRecording}
                disabled={disabled}
                icon={<Mic size={20} />}
              >
                Start Recording
              </Button>
            ) : (
              <Button
                variant="error"
                onClick={stopRecording}
                icon={<Square size={20} />}
                className="animate-pulse"
              >
                Stop Recording
              </Button>
            )}
          </div>

          {/* Playback Controls */}
          {recordedBlob && !isRecording && (
            <div className="space-y-3 pt-4 border-t border-dark-border">
              <audio
                controls
                src={URL.createObjectURL(recordedBlob)}
                className="w-full"
              />
              
              <div className="flex justify-center gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={downloadRecording}
                  icon={<Download size={16} />}
                >
                  Download
                </Button>
                
                <Button
                  variant="primary"
                  size="sm"
                  onClick={processRecording}
                  disabled={disabled}
                >
                  Process Command
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default MicRecorder;