import React from 'react';
import { Server, AlertTriangle, CheckCircle, Wifi, WifiOff } from 'lucide-react';
import Card from './Card';

const BackendStatus = ({ backendAvailable, textConnected, audioConnected }) => {
  const getStatusColor = () => {
    if (!backendAvailable) return 'error';
    if (textConnected && audioConnected) return 'success';
    if (textConnected || audioConnected) return 'warning';
    return 'error';
  };

  const getStatusText = () => {
    if (!backendAvailable) return 'Backend Server Offline';
    if (textConnected && audioConnected) return 'All Services Connected';
    if (textConnected || audioConnected) return 'Partial Connection';
    return 'Services Disconnected';
  };

  const getStatusIcon = () => {
    if (!backendAvailable) return <Server size={20} />;
    if (textConnected && audioConnected) return <CheckCircle size={20} />;
    return <AlertTriangle size={20} />;
  };

  const statusColor = getStatusColor();

  return (
    <Card className="mb-6">
      <Card.Header>
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div>
            <Card.Title className="mb-0">Backend Status</Card.Title>
            <Card.Subtitle>Server and service connectivity</Card.Subtitle>
          </div>
        </div>
      </Card.Header>

      <Card.Body>
        <div className="space-y-4">
          {/* Overall Status */}
          <div className={`p-4 rounded-lg border ${
            statusColor === 'success' ? 'bg-success-500/20 border-success-500' :
            statusColor === 'warning' ? 'bg-warning-500/20 border-warning-500' :
            'bg-error-500/20 border-error-500'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-medium">
                {getStatusText()}
              </span>
              <div className={`w-3 h-3 rounded-full ${
                statusColor === 'success' ? 'bg-success-500' :
                statusColor === 'warning' ? 'bg-warning-500' :
                'bg-error-500'
              }`}></div>
            </div>
          </div>

          {/* Service Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Backend Server */}
            <div className="flex items-center gap-3 p-3 bg-dark-bg-tertiary rounded-lg">
              <Server size={16} className={backendAvailable ? 'text-success-500' : 'text-error-500'} />
              <div>
                <p className="text-sm font-medium">Backend Server</p>
                <p className={`text-xs ${backendAvailable ? 'text-success-400' : 'text-error-400'}`}>
                  {backendAvailable ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>

            {/* Text WebSocket */}
            <div className="flex items-center gap-3 p-3 bg-dark-bg-tertiary rounded-lg">
              {textConnected ? <Wifi size={16} className="text-success-500" /> : <WifiOff size={16} className="text-error-500" />}
              <div>
                <p className="text-sm font-medium">Text WebSocket</p>
                <p className={`text-xs ${textConnected ? 'text-success-400' : 'text-error-400'}`}>
                  {textConnected ? 'Connected' : 'Disconnected'}
                </p>
              </div>
            </div>

            {/* Audio WebSocket */}
            <div className="flex items-center gap-3 p-3 bg-dark-bg-tertiary rounded-lg">
              {audioConnected ? <Wifi size={16} className="text-success-500" /> : <WifiOff size={16} className="text-error-500" />}
              <div>
                <p className="text-sm font-medium">Audio WebSocket</p>
                <p className={`text-xs ${audioConnected ? 'text-success-400' : 'text-error-400'}`}>
                  {audioConnected ? 'Connected' : 'Disconnected'}
                </p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          {!backendAvailable && (
            <div className="p-4 bg-warning-500/20 border border-warning-500 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle size={16} className="text-warning-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-warning-400 mb-2">Backend Server Required</h4>
                  <p className="text-sm text-warning-300 mb-3">
                    To use voice features and device control, you need to start the backend server.
                  </p>
                  <div className="text-sm text-warning-300 space-y-1">
                    <p><strong>To start the backend:</strong></p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>Open a terminal in the project root directory</li>
                      <li>Run: <code className="bg-dark-bg-primary px-2 py-1 rounded">python main.py</code></li>
                      <li>Wait for the server to start on <code className="bg-dark-bg-primary px-2 py-1 rounded">http://localhost:8000</code></li>
                      <li>Refresh this page</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default BackendStatus;
