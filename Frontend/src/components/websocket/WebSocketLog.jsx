import React, { useState, useRef, useEffect } from 'react';
import { Activity, Trash2, Download, Pause, Play } from 'lucide-react';
import { useWebSocket } from '../../hooks/useWebSocket';
import { formatDateTime } from '../../utils/helpers';
import Card from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';

const WebSocketLog = () => {
  const [isPaused, setIsPaused] = useState(false);
  const [filter, setFilter] = useState('all');
  const [messages, setMessages] = useState([]);
  const logEndRef = useRef(null);
  
  const { isConnected, connectionStatus } = useWebSocket();

  useEffect(() => {
    if (!isPaused) {
      scrollToBottom();
    }
  }, [messages, isPaused]);

  const scrollToBottom = () => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getMessageTypeColor = (type) => {
    switch (type) {
      case 'text':
        return 'info';
      case 'audio':
        return 'warning';
      case 'command':
        return 'success';
      case 'error':
        return 'error';
      default:
        return 'secondary';
    }
  };

  const getMessageTypeIcon = (type) => {
    switch (type) {
      case 'audio':
        return '🎵';
      case 'command':
        return '⚡';
      case 'error':
        return '❌';
      default:
        return '💬';
    }
  };

  const filteredMessages = messages.filter(message => {
    if (filter === 'all') return true;
    return message.type === filter;
  });

  const clearMessages = () => {
    setMessages([]);
  };

  const downloadLog = () => {
    const logData = messages.map((message, index) => ({
      index: index + 1,
      timestamp: formatDateTime(message.timestamp),
      type: message.type,
      data: JSON.stringify(message.data, null, 2),
    }));

    const blob = new Blob([JSON.stringify(logData, null, 2)], {
      type: 'application/json',
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `websocket-log-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="h-[500px] flex flex-col">
      <Card.Header>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity size={20} />
            <div>
              <Card.Title className="mb-0">WebSocket Live Log</Card.Title>
              <div className="flex items-center gap-2 text-sm text-muted">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success-500' : 'bg-error-500'}`}></div>
                {isConnected ? 'Connected' : 'Disconnected'}
                <span>•</span>
                <span>{messages.length} messages</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter Dropdown */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input text-sm"
            >
              <option value="all">All Messages</option>
              <option value="text">Text</option>
              <option value="audio">Audio</option>
              <option value="command">Commands</option>
              <option value="error">Errors</option>
            </select>

            {/* Pause/Play Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPaused(!isPaused)}
              icon={isPaused ? <Play size={16} /> : <Pause size={16} />}
            >
              {isPaused ? 'Resume' : 'Pause'}
            </Button>

            {/* Download Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={downloadLog}
              disabled={messages.length === 0}
              icon={<Download size={16} />}
            >
              Download
            </Button>

            {/* Clear Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearMessages}
              disabled={messages.length === 0}
              icon={<Trash2 size={16} />}
            >
              Clear
            </Button>
          </div>
        </div>
      </Card.Header>

      {/* Connection Status */}
      <div className="px-6 py-3 border-b border-dark-border bg-dark-bg-tertiary">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted">Text:</span>
            <Badge variant={connectionStatus.textConnected ? 'success' : 'error'}>
              {connectionStatus.textConnected ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted">Audio:</span>
            <Badge variant={connectionStatus.audioConnected ? 'success' : 'error'}>
              {connectionStatus.audioConnected ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredMessages.length === 0 ? (
          <div className="text-center py-8 text-muted">
            <Activity size={32} className="mx-auto mb-2 opacity-50" />
            <p>No messages to display</p>
            <p className="text-sm">WebSocket messages will appear here</p>
          </div>
        ) : (
          filteredMessages.map((message, index) => (
            <div
              key={message.id || index}
              className="flex items-start gap-3 p-3 bg-dark-bg-tertiary rounded-lg"
            >
              <div className="flex-shrink-0">
                <span className="text-lg">{getMessageTypeIcon(message.type)}</span>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={getMessageTypeColor(message.type)}>
                    {message.type.toUpperCase()}
                  </Badge>
                  <span className="text-xs text-muted">
                    {formatDateTime(message.timestamp)}
                  </span>
                </div>
                
                <div className="text-sm">
                  {typeof message.data === 'string' ? (
                    <pre className="whitespace-pre-wrap break-words">{message.data}</pre>
                  ) : (
                    <pre className="whitespace-pre-wrap break-words">
                      {JSON.stringify(message.data, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        
        <div ref={logEndRef} />
      </div>
    </Card>
  );
};

export default WebSocketLog;