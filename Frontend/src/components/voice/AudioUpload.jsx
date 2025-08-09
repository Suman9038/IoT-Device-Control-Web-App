import React, { useState, useRef } from 'react';
import { Upload, File, X } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import Card from '../common/Card';
import Button from '../common/Button';

const AudioUpload = ({ onFileUpload, disabled = false }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const { error: showError, info: showInfo } = useToast();

  const validateFile = (file) => {
    const validTypes = ['audio/wav', 'audio/mpeg', 'audio/mp3', 'audio/ogg'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      showError('Please select a valid audio file (WAV, MP3, OGG)');
      return false;
    }

    if (file.size > maxSize) {
      showError('File size must be less than 10MB');
      return false;
    }

    return true;
  };

  const handleFileSelect = (file) => {
    if (validateFile(file)) {
      setSelectedFile(file);
      showInfo(`Selected: ${file.name}`);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleInputChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      onFileUpload && onFileUpload(selectedFile);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes) => {
    const units = ['B', 'KB', 'MB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  return (
    <Card>
      <Card.Header>
        <Card.Title>Audio File Upload</Card.Title>
        <Card.Subtitle>Upload pre-recorded voice commands</Card.Subtitle>
      </Card.Header>

      <Card.Body>
        <div className="space-y-4">
          {/* Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
              dragOver
                ? 'border-primary-500 bg-primary-500/10'
                : 'border-dark-border hover:border-primary-500 hover:bg-primary-500/5'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={openFileDialog}
          >
            <Upload size={32} className="mx-auto mb-2 text-muted" />
            <p className="text-lg font-medium mb-1">
              Drop audio file here or click to browse
            </p>
            <p className="text-sm text-muted">
              Supports WAV, MP3, OGG files up to 10MB
            </p>
          </div>

          {/* File Input (Hidden) */}
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleInputChange}
            className="hidden"
          />

          {/* Selected File Display */}
          {selectedFile && (
            <div className="bg-dark-bg-tertiary rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <File size={20} className="text-primary-500" />
                  <div>
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-muted">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                  icon={<X size={16} />}
                />
              </div>

              <div className="mt-3 pt-3 border-t border-dark-border">
                <Button
                  variant="primary"
                  onClick={handleUpload}
                  disabled={disabled}
                  className="w-full"
                >
                  Process Voice Command
                </Button>
              </div>
            </div>
          )}

          {/* Upload Instructions */}
          <div className="text-sm text-muted space-y-1">
            <p>• Supported formats: WAV, MP3, OGG</p>
            <p>• Maximum file size: 10MB</p>
            <p>• Clear audio recordings work best</p>
            <p>• Try saying "Jarvis" followed by your command</p>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default AudioUpload;